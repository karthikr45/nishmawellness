import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Burnout Prediction Engine
// Analyzes mood trends, journal patterns, exercise drops, session skips
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      members: { include: { user: { select: { id: true } }, department: { select: { id: true, name: true } }, location: { select: { id: true, name: true } } } },
      locations: { include: { divisions: { include: { departments: true } } } },
    },
  });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  // Analyze each member's burnout signals
  const memberRisks: { userId: string; score: number; factors: string[]; deptName: string; locName: string }[] = [];

  for (const member of org.members) {
    const userId = member.user.id;
    const factors: string[] = [];
    let riskScore = 0;

    // 1. Mood decline (recent 2 weeks vs previous 2 weeks)
    const [recentMood, olderMood] = await Promise.all([
      prisma.progress.findMany({ where: { userId, type: "MOOD", date: { gte: twoWeeksAgo } } }),
      prisma.progress.findMany({ where: { userId, type: "MOOD", date: { gte: fourWeeksAgo, lt: twoWeeksAgo } } }),
    ]);

    const recentAvg = recentMood.length > 0 ? recentMood.reduce((s, m) => s + m.value, 0) / recentMood.length : null;
    const olderAvg = olderMood.length > 0 ? olderMood.reduce((s, m) => s + m.value, 0) / olderMood.length : null;

    if (recentAvg !== null && recentAvg < 40) { riskScore += 25; factors.push("Low mood score"); }
    if (recentAvg !== null && olderAvg !== null && recentAvg < olderAvg - 15) { riskScore += 20; factors.push("Declining mood trend"); }

    // 2. Journal sentiment — look for burnout keywords
    const journals = await prisma.journalEntry.findMany({ where: { userId, date: { gte: twoWeeksAgo } } });
    const burnoutKeywords = ["overwhelm", "exhausted", "can't cope", "burned out", "hate my job", "quit", "breaking point", "too much"];
    for (const j of journals) {
      const text = `${j.freeWrite} ${j.challenge}`.toLowerCase();
      if (burnoutKeywords.some((k) => text.includes(k))) { riskScore += 15; factors.push("Burnout language in journal"); break; }
    }
    if (journals.length > 0) {
      const avgAnxiety = journals.reduce((s, j) => s + j.anxiety, 0) / journals.length;
      if (avgAnxiety >= 7) { riskScore += 10; factors.push("High anxiety levels"); }
      const avgEnergy = journals.reduce((s, j) => s + j.energy, 0) / journals.length;
      if (avgEnergy <= 3) { riskScore += 10; factors.push("Very low energy"); }
    }

    // 3. Sleep quality decline
    const recentSleep = await prisma.progress.findMany({ where: { userId, type: "SLEEP", date: { gte: twoWeeksAgo } } });
    if (recentSleep.length > 0) {
      const avgSleep = recentSleep.reduce((s, p) => s + p.value, 0) / recentSleep.length;
      if (avgSleep < 40) { riskScore += 10; factors.push("Poor sleep quality"); }
    }

    // 4. Exercise drop-off
    const recentExercise = await prisma.exerciseLog.count({ where: { userId, createdAt: { gte: twoWeeksAgo } } });
    const olderExercise = await prisma.exerciseLog.count({ where: { userId, createdAt: { gte: fourWeeksAgo, lt: twoWeeksAgo } } });
    if (olderExercise > 2 && recentExercise === 0) { riskScore += 10; factors.push("Stopped exercising"); }

    // 5. Disengagement — no platform activity
    const recentActivity = await prisma.userActivity.count({ where: { userId, createdAt: { gte: twoWeeksAgo } } });
    if (recentActivity === 0) { riskScore += 10; factors.push("No platform engagement"); }

    // 6. Severe assessment scores
    const recentAssessment = await prisma.assessment.findFirst({
      where: { userId, createdAt: { gte: fourWeeksAgo } },
      orderBy: { createdAt: "desc" },
    });
    if (recentAssessment && (recentAssessment.severity === "SEVERE" || recentAssessment.severity === "MODERATELY_SEVERE")) {
      riskScore += 20; factors.push(`${recentAssessment.type} score: ${recentAssessment.severity}`);
    }

    riskScore = Math.min(100, riskScore);

    memberRisks.push({
      userId,
      score: riskScore,
      factors,
      deptName: member.department?.name || "Unassigned",
      locName: member.location?.name || "Unassigned",
    });
  }

  // Aggregate by department
  const deptMap: Record<string, { scores: number[]; factors: string[]; count: number }> = {};
  for (const mr of memberRisks) {
    if (!deptMap[mr.deptName]) deptMap[mr.deptName] = { scores: [], factors: [], count: 0 };
    deptMap[mr.deptName].scores.push(mr.score);
    deptMap[mr.deptName].factors.push(...mr.factors);
    deptMap[mr.deptName].count++;
  }

  const departmentRisks = Object.entries(deptMap).map(([name, data]) => {
    const avgScore = Math.round(data.scores.reduce((s, v) => s + v, 0) / data.scores.length);
    const atRisk = data.scores.filter((s) => s >= 50).length;
    const factorCounts: Record<string, number> = {};
    data.factors.forEach((f) => { factorCounts[f] = (factorCounts[f] || 0) + 1; });
    const topFactors = Object.entries(factorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f]) => f);

    return {
      department: name,
      riskScore: avgScore,
      riskLevel: avgScore >= 70 ? "CRITICAL" : avgScore >= 50 ? "HIGH" : avgScore >= 30 ? "MODERATE" : "LOW",
      employeeCount: data.count,
      atRiskCount: atRisk,
      topFactors,
      trend: "STABLE", // Would compare with previous period
    };
  }).sort((a, b) => b.riskScore - a.riskScore);

  // Org-wide summary
  const allScores = memberRisks.map((m) => m.score);
  const orgAvg = allScores.length > 0 ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length) : 0;
  const orgAtRisk = allScores.filter((s) => s >= 50).length;
  const orgCritical = allScores.filter((s) => s >= 70).length;

  // Auto-create incidents for critical departments
  for (const dept of departmentRisks) {
    if (dept.riskLevel === "CRITICAL") {
      const existing = await prisma.criticalIncident.findFirst({
        where: { organizationId: orgId, type: "BURNOUT_ALERT", status: { not: "RESOLVED" }, description: { contains: dept.department } },
      });
      if (!existing) {
        await prisma.criticalIncident.create({
          data: {
            organizationId: orgId,
            type: "BURNOUT_ALERT",
            severity: "HIGH",
            description: `${dept.department} department has critical burnout risk (score: ${dept.riskScore}/100). ${dept.atRiskCount} of ${dept.employeeCount} employees showing burnout signals. Top factors: ${dept.topFactors.join(", ")}.`,
            isAnonymous: true,
          },
        });
      }
    }
  }

  return NextResponse.json({
    orgSummary: {
      avgRiskScore: orgAvg,
      riskLevel: orgAvg >= 70 ? "CRITICAL" : orgAvg >= 50 ? "HIGH" : orgAvg >= 30 ? "MODERATE" : "LOW",
      totalEmployees: memberRisks.length,
      atRiskCount: orgAtRisk,
      criticalCount: orgCritical,
    },
    departmentRisks,
    topOrgFactors: (() => {
      const all: Record<string, number> = {};
      memberRisks.forEach((m) => m.factors.forEach((f) => { all[f] = (all[f] || 0) + 1; }));
      return Object.entries(all).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([f, c]) => ({ factor: f, count: c }));
    })(),
  });
}
