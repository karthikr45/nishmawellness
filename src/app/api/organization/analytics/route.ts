import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Aggregated analytics for an organization
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json({ error: "orgId required" }, { status: 400 });
  }

  // Verify access
  if (session.user.role !== "ADMIN") {
    const membership = await prisma.orgMember.findFirst({
      where: { organizationId: orgId, userId: session.user.id, role: { in: ["ORG_ADMIN", "HR_MANAGER"] } },
    });
    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { members: { include: { user: { select: { id: true } }, department: { select: { name: true } } } } },
  });

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const memberUserIds = org.members.map((m) => m.user.id);

  // Aggregate anonymous stats
  const [
    totalSessions,
    completedSessions,
    totalEnrollments,
    avgProgress,
    moodData,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { patientId: { in: memberUserIds } },
    }),
    prisma.appointment.count({
      where: { patientId: { in: memberUserIds }, status: "COMPLETED" },
    }),
    prisma.enrollment.count({
      where: { userId: { in: memberUserIds } },
    }),
    prisma.enrollment.aggregate({
      where: { userId: { in: memberUserIds } },
      _avg: { progress: true },
    }),
    prisma.progress.findMany({
      where: { userId: { in: memberUserIds }, type: "MOOD" },
      orderBy: { date: "desc" },
      take: memberUserIds.length * 7,
    }),
  ]);

  // Department breakdown (anonymous)
  const departmentStats: Record<string, { count: number; sessionsUsed: number }> = {};
  for (const member of org.members) {
    const dept = member.department?.name || "Unassigned";
    if (!departmentStats[dept]) {
      departmentStats[dept] = { count: 0, sessionsUsed: 0 };
    }
    departmentStats[dept].count++;
    departmentStats[dept].sessionsUsed += member.sessionsUsed;
  }

  const avgMood = moodData.length > 0
    ? Math.round(moodData.reduce((s, m) => s + m.value, 0) / moodData.length)
    : null;

  const engagementRate = org.members.length > 0
    ? Math.round((org.members.filter((m) => m.sessionsUsed > 0).length / org.members.length) * 100)
    : 0;

  return NextResponse.json({
    organization: {
      name: org.name,
      plan: org.plan,
      totalMembers: org.members.length,
      maxEmployees: org.maxEmployees,
      sessionsPerEmployee: org.sessionsPerEmployee,
    },
    stats: {
      totalSessions,
      completedSessions,
      totalEnrollments,
      avgProgramProgress: Math.round(avgProgress._avg.progress || 0),
      avgMoodScore: avgMood,
      engagementRate,
    },
    departmentStats,
  });
}
