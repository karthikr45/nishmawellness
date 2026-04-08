import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Company analytics with hierarchy drill-down
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  const locationId = searchParams.get("locationId");
  const departmentId = searchParams.get("departmentId");

  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  // Build member filter based on drill-down level
  const memberWhere: Record<string, unknown> = { organizationId: orgId };
  if (locationId) memberWhere.locationId = locationId;
  if (departmentId) memberWhere.departmentId = departmentId;

  const members = await prisma.orgMember.findMany({
    where: memberWhere,
    select: { userId: true, sessionsUsed: true, location: { select: { name: true } }, department: { select: { name: true } } },
  });

  const userIds = members.map((m) => m.userId);
  if (userIds.length === 0) {
    return NextResponse.json({ members: 0, metrics: {}, heatmap: [] });
  }

  // Aggregate metrics
  const [sessions, mood, exercises, journals, assessments] = await Promise.all([
    prisma.appointment.count({ where: { patientId: { in: userIds }, status: "COMPLETED" } }),
    prisma.progress.findMany({ where: { userId: { in: userIds }, type: "MOOD" }, orderBy: { date: "desc" }, take: userIds.length * 7 }),
    prisma.exerciseLog.count({ where: { userId: { in: userIds }, completed: true } }),
    prisma.journalEntry.count({ where: { userId: { in: userIds } } }),
    prisma.assessment.findMany({ where: { userId: { in: userIds } }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const avgMood = mood.length > 0 ? Math.round(mood.reduce((s, m) => s + m.value, 0) / mood.length) : null;
  const activeUsers = new Set(mood.map((m) => m.userId)).size;
  const engagementRate = userIds.length > 0 ? Math.round((activeUsers / userIds.length) * 100) : 0;

  // Heatmap: per-location or per-department engagement
  const heatmap: { name: string; members: number; engagement: number; avgMood: number | null }[] = [];

  if (!locationId) {
    // Location-level heatmap
    const locations = await prisma.orgLocation.findMany({
      where: { organizationId: orgId },
      include: { members: { select: { userId: true, sessionsUsed: true } } },
    });
    for (const loc of locations) {
      const locUserIds = loc.members.map((m) => m.userId);
      const locMood = mood.filter((m) => locUserIds.includes(m.userId));
      const locAvgMood = locMood.length > 0 ? Math.round(locMood.reduce((s, m) => s + m.value, 0) / locMood.length) : null;
      const locActive = new Set(locMood.map((m) => m.userId)).size;
      heatmap.push({
        name: loc.name,
        members: loc.members.length,
        engagement: loc.members.length > 0 ? Math.round((locActive / loc.members.length) * 100) : 0,
        avgMood: locAvgMood,
      });
    }
  } else {
    // Department-level heatmap within a location
    const departments = await prisma.orgDepartment.findMany({
      where: { division: { locationId } },
      include: { members: { select: { userId: true } } },
    });
    for (const dept of departments) {
      const deptUserIds = dept.members.map((m) => m.userId);
      const deptMood = mood.filter((m) => deptUserIds.includes(m.userId));
      const deptAvgMood = deptMood.length > 0 ? Math.round(deptMood.reduce((s, m) => s + m.value, 0) / deptMood.length) : null;
      heatmap.push({
        name: dept.name,
        members: dept.members.length,
        engagement: dept.members.length > 0 ? Math.round((new Set(deptMood.map((m) => m.userId)).size / dept.members.length) * 100) : 0,
        avgMood: deptAvgMood,
      });
    }
  }

  // Assessment severity distribution (anonymized)
  const severityDist: Record<string, number> = { MINIMAL: 0, MILD: 0, MODERATE: 0, MODERATELY_SEVERE: 0, SEVERE: 0 };
  for (const a of assessments) {
    severityDist[a.severity] = (severityDist[a.severity] || 0) + 1;
  }

  return NextResponse.json({
    level: departmentId ? "department" : locationId ? "location" : "organization",
    memberCount: userIds.length,
    metrics: {
      totalSessions: sessions,
      avgMoodScore: avgMood,
      engagementRate,
      activeUsers,
      exercisesCompleted: exercises,
      journalEntries: journals,
    },
    heatmap,
    assessmentDistribution: severityDist,
  });
}
