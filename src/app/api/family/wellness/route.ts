import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section") || "habits";
  const familyGroupId = searchParams.get("familyGroupId");

  if (!familyGroupId) return NextResponse.json({ error: "familyGroupId required" }, { status: 400 });

  if (section === "habits") {
    const habits = await prisma.familyHabit.findMany({
      where: { familyGroupId, isActive: true },
      include: {
        assigns: { include: { child: { select: { id: true, name: true } } } },
        logs: {
          where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        },
      },
    });
    // Calculate streaks per habit
    const habitsWithStreaks = await Promise.all(habits.map(async (h) => {
      const recentLogs = await prisma.familyHabitLog.findMany({
        where: { habitId: h.id },
        orderBy: { date: "desc" },
        take: 30,
      });
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().slice(0, 10);
        const hasLog = recentLogs.some((l) => l.date.toISOString().slice(0, 10) === dayStr && l.completed);
        if (hasLog) streak++;
        else break;
      }
      return { ...h, streak, todayDone: h.logs.length > 0 };
    }));
    return NextResponse.json(habitsWithStreaks);
  }

  if (section === "goals") {
    const goals = await prisma.familyGoal.findMany({
      where: { familyGroupId, status: { in: ["ACTIVE", "COMPLETED"] } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(goals);
  }

  if (section === "gratitude") {
    const gratitudes = await prisma.familyGratitude.findMany({
      where: { familyGroupId },
      include: {
        fromUser: { select: { name: true } },
        toUser: { select: { name: true } },
      },
      orderBy: { date: "desc" },
      take: 20,
    });
    return NextResponse.json(gratitudes);
  }

  return NextResponse.json({ error: "Unknown section" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // HABITS
  if (action === "createHabit") {
    const { familyGroupId, name, icon, frequency } = body;
    const habit = await prisma.familyHabit.create({
      data: { familyGroupId, name, icon: icon || "✅", frequency: frequency || "DAILY" },
    });
    return NextResponse.json(habit);
  }

  if (action === "logHabit") {
    const { habitId, childId } = body;
    const log = await prisma.familyHabitLog.create({
      data: { habitId, userId: session.user.id, childId: childId || null },
    });
    return NextResponse.json(log);
  }

  // GOALS
  if (action === "createGoal") {
    const { familyGroupId, title, description, category, targetValue, unit, deadline } = body;
    const goal = await prisma.familyGoal.create({
      data: {
        familyGroupId,
        title,
        description: description || null,
        category: category || "GENERAL",
        targetValue: targetValue ? parseInt(targetValue) : null,
        unit: unit || null,
        deadline: deadline ? new Date(deadline) : null,
      },
    });
    return NextResponse.json(goal);
  }

  if (action === "updateGoal") {
    const { goalId, currentValue, status } = body;
    const goal = await prisma.familyGoal.update({
      where: { id: goalId },
      data: {
        ...(currentValue !== undefined ? { currentValue: parseInt(currentValue) } : {}),
        ...(status ? { status } : {}),
      },
    });
    return NextResponse.json(goal);
  }

  // GRATITUDE
  if (action === "sendGratitude") {
    const { familyGroupId, toUserId, message } = body;
    if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });
    const gratitude = await prisma.familyGratitude.create({
      data: { familyGroupId, fromUserId: session.user.id, toUserId, message },
      include: { fromUser: { select: { name: true } }, toUser: { select: { name: true } } },
    });
    return NextResponse.json(gratitude);
  }

  // COUPLE GOALS
  if (action === "createCoupleGoal") {
    const { partnershipId, title, category, deadline } = body;
    const goal = await prisma.coupleGoal.create({
      data: { partnershipId, title, category: category || "RELATIONSHIP", deadline: deadline ? new Date(deadline) : null },
    });
    return NextResponse.json(goal);
  }

  if (action === "completeCoupleGoal") {
    const { goalId } = body;
    const goal = await prisma.coupleGoal.findUnique({ where: { id: goalId } });
    if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Determine which partner is completing
    const partnership = await prisma.couplePartnership.findFirst({
      where: { OR: [{ partnerAId: session.user.id }, { partnerBId: session.user.id }] },
    });
    const isA = partnership?.partnerAId === session.user.id;

    const updated = await prisma.coupleGoal.update({
      where: { id: goalId },
      data: {
        ...(isA ? { partnerADone: true } : { partnerBDone: true }),
        status: (isA && goal.partnerBDone) || (!isA && goal.partnerADone) ? "COMPLETED" : "ACTIVE",
      },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
