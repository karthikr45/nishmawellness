import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Team Wellness Leaderboard
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      locations: { include: { divisions: { include: { departments: { include: { members: { include: { user: { select: { id: true } } } } } } } } } },
    },
  });
  if (!org) return NextResponse.json([]);

  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const teams: { name: string; location: string; score: number; participation: number; members: number; exercisePoints: number; journalPoints: number; moodPoints: number }[] = [];

  for (const loc of org.locations) {
    for (const div of loc.divisions) {
      for (const dept of div.departments) {
        const userIds = dept.members.map((m) => m.user.id);
        if (userIds.length === 0) continue;

        const [exercises, journals, mood] = await Promise.all([
          prisma.exerciseLog.count({ where: { userId: { in: userIds }, completed: true, createdAt: { gte: twoWeeksAgo } } }),
          prisma.journalEntry.count({ where: { userId: { in: userIds }, date: { gte: twoWeeksAgo } } }),
          prisma.progress.findMany({ where: { userId: { in: userIds }, type: "MOOD", date: { gte: twoWeeksAgo } } }),
        ]);

        const avgMood = mood.length > 0 ? Math.round(mood.reduce((s, m) => s + m.value, 0) / mood.length) : 50;
        const activeUsers = new Set([
          ...mood.map((m) => m.userId),
        ]).size;

        const exercisePoints = exercises * 25;
        const journalPoints = journals * 10;
        const moodPoints = Math.round(avgMood * 0.5);
        const score = exercisePoints + journalPoints + moodPoints;
        const participation = Math.round((activeUsers / userIds.length) * 100);

        teams.push({
          name: dept.name,
          location: loc.name,
          score,
          participation,
          members: userIds.length,
          exercisePoints,
          journalPoints,
          moodPoints,
        });
      }
    }
  }

  teams.sort((a, b) => b.score - a.score);
  return NextResponse.json(teams);
}
