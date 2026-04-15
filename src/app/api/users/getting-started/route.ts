import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Returns a first-run completion map for the patient dashboard checklist.
// Each boolean = has the user completed that milestone at least once?
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [journalCount, chatCount, assessmentCount, appointmentCount, exerciseCount] = await Promise.all([
    prisma.journalEntry.count({ where: { userId } }),
    prisma.aIChat.count({ where: { userId, role: "user" } }),
    prisma.assessment.count({ where: { userId } }),
    prisma.appointment.count({ where: { patientId: userId } }),
    prisma.exerciseLog.count({ where: { userId } }),
  ]);

  const milestones = {
    hasJournaled: journalCount > 0,
    hasChatted: chatCount > 0,
    hasAssessed: assessmentCount > 0,
    hasBookedSession: appointmentCount > 0,
    hasExercised: exerciseCount > 0,
  };

  const completedCount = Object.values(milestones).filter(Boolean).length;

  return NextResponse.json({
    ...milestones,
    completedCount,
    totalCount: 5,
  });
}
