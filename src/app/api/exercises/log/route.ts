import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { exerciseId, completed, duration, rating } = await req.json();

  const log = await prisma.exerciseLog.create({
    data: {
      userId: session.user.id,
      exerciseId,
      completed: completed ?? true,
      duration: duration || 0,
      rating: rating || null,
    },
  });

  // Log mindfulness progress
  await prisma.progress.create({
    data: {
      userId: session.user.id,
      type: "MINDFULNESS",
      value: completed ? 100 : 50,
    },
  });

  return NextResponse.json(log);
}
