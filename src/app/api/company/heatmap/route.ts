import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Department wellness heatmap
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      locations: { include: { members: { include: { user: { select: { id: true } } } }, divisions: { include: { departments: { include: { members: { include: { user: { select: { id: true } } } } } } } } } },
    },
  });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const heatmap: { name: string; type: string; parentName?: string; members: number; avgMood: number | null; engagement: number; status: string }[] = [];

  // Location-level heatmap
  for (const loc of org.locations) {
    const locUserIds = loc.members.map((m) => m.user.id);
    const mood = await prisma.progress.findMany({
      where: { userId: { in: locUserIds }, type: "MOOD", date: { gte: twoWeeksAgo } },
    });
    const avgMood = mood.length > 0 ? Math.round(mood.reduce((s, m) => s + m.value, 0) / mood.length) : null;
    const activeUsers = new Set(mood.map((m) => m.userId)).size;
    const engagement = locUserIds.length > 0 ? Math.round((activeUsers / locUserIds.length) * 100) : 0;

    heatmap.push({
      name: loc.name,
      type: "LOCATION",
      members: locUserIds.length,
      avgMood,
      engagement,
      status: avgMood === null ? "NO_DATA" : avgMood >= 70 ? "HEALTHY" : avgMood >= 50 ? "MODERATE" : avgMood >= 30 ? "CONCERNING" : "CRITICAL",
    });

    // Department-level within each location
    for (const div of loc.divisions) {
      for (const dept of div.departments) {
        const deptUserIds = dept.members.map((m) => m.user.id);
        if (deptUserIds.length === 0) continue;
        const deptMood = await prisma.progress.findMany({
          where: { userId: { in: deptUserIds }, type: "MOOD", date: { gte: twoWeeksAgo } },
        });
        const deptAvgMood = deptMood.length > 0 ? Math.round(deptMood.reduce((s, m) => s + m.value, 0) / deptMood.length) : null;
        const deptActive = new Set(deptMood.map((m) => m.userId)).size;

        heatmap.push({
          name: dept.name,
          type: "DEPARTMENT",
          parentName: loc.name,
          members: deptUserIds.length,
          avgMood: deptAvgMood,
          engagement: Math.round((deptActive / deptUserIds.length) * 100),
          status: deptAvgMood === null ? "NO_DATA" : deptAvgMood >= 70 ? "HEALTHY" : deptAvgMood >= 50 ? "MODERATE" : deptAvgMood >= 30 ? "CONCERNING" : "CRITICAL",
        });
      }
    }
  }

  return NextResponse.json(heatmap);
}
