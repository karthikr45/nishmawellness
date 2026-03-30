import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId, status, timeSpent, quizScore } = await req.json();

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    create: {
      userId: session.user.id,
      lessonId,
      status: status || "IN_PROGRESS",
      timeSpent: timeSpent || 0,
      quizScore: quizScore ?? null,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
    update: {
      status: status || "IN_PROGRESS",
      ...(timeSpent && { timeSpent }),
      ...(quizScore !== undefined && { quizScore }),
      ...(status === "COMPLETED" && { completedAt: new Date() }),
    },
  });

  // Update enrollment progress
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { programId: true } });
  if (lesson) {
    const totalLessons = await prisma.lesson.count({ where: { programId: lesson.programId } });
    const completedLessons = await prisma.lessonProgress.count({
      where: { userId: session.user.id, status: "COMPLETED", lesson: { programId: lesson.programId } },
    });
    const progressPct = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    await prisma.enrollment.updateMany({
      where: { userId: session.user.id, programId: lesson.programId },
      data: { progress: progressPct, ...(progressPct >= 100 ? { status: "COMPLETED", completedAt: new Date() } : {}) },
    });
  }

  return NextResponse.json(progress);
}
