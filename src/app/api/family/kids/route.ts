import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const children = await prisma.childProfile.findMany({
    where: { parentId: session.user.id },
    include: {
      growthLogs: { orderBy: { date: "desc" }, take: 5 },
      moodLogs: { orderBy: { date: "desc" }, take: 7 },
      foodLogs: { orderBy: { date: "desc" }, take: 7, where: { date: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
      sleepLogs: { orderBy: { date: "desc" }, take: 7 },
      milestones: { orderBy: { date: "desc" }, take: 10 },
    },
    orderBy: { dateOfBirth: "asc" },
  });

  return NextResponse.json(children);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === "addChild") {
    const { name, dateOfBirth, gender, allergies, conditions, bloodGroup, school, grade } = body;
    if (!name || !dateOfBirth) return NextResponse.json({ error: "Name and date of birth required" }, { status: 400 });
    const child = await prisma.childProfile.create({
      data: {
        parentId: session.user.id,
        name,
        dateOfBirth: new Date(dateOfBirth),
        gender: gender || null,
        allergies: JSON.stringify(allergies || []),
        conditions: JSON.stringify(conditions || []),
        bloodGroup: bloodGroup || null,
        school: school || null,
        grade: grade || null,
      },
    });
    return NextResponse.json(child);
  }

  if (action === "logGrowth") {
    const { childId, height, weight, headCirc, notes } = body;
    const log = await prisma.childGrowthLog.create({
      data: { childId, height: height ? parseFloat(height) : null, weight: weight ? parseFloat(weight) : null, headCirc: headCirc ? parseFloat(headCirc) : null, notes },
    });
    return NextResponse.json(log);
  }

  if (action === "logMood") {
    const { childId, mood, energy, notes } = body;
    const log = await prisma.childMoodLog.create({
      data: { childId, loggedById: session.user.id, mood, energy: energy ? parseInt(energy) : null, notes },
    });
    return NextResponse.json(log);
  }

  if (action === "logFood") {
    const { childId, mealType, items, waterCups, category, notes } = body;
    const log = await prisma.childFoodLog.create({
      data: { childId, loggedById: session.user.id, mealType, items: JSON.stringify(items || []), waterCups: waterCups ? parseInt(waterCups) : null, category: category || null, notes },
    });
    return NextResponse.json(log);
  }

  if (action === "logSleep") {
    const { childId, bedtime, wakeTime, napMinutes, quality, notes } = body;
    const log = await prisma.childSleepLog.create({
      data: { childId, bedtime, wakeTime, napMinutes: napMinutes ? parseInt(napMinutes) : null, quality: quality ? parseInt(quality) : null, notes },
    });
    return NextResponse.json(log);
  }

  if (action === "addMilestone") {
    const { childId, title, category, date, notes } = body;
    const milestone = await prisma.childMilestone.create({
      data: { childId, title, category: category || "PHYSICAL", date: date ? new Date(date) : new Date(), notes },
    });
    return NextResponse.json(milestone);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
