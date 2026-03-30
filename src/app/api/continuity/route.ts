import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get continuity scores for a therapist
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const therapistId = searchParams.get("therapistId") || session.user.id;

  const scores = await prisma.continuityScore.findMany({
    where: { therapistId },
    include: {
      patient: { select: { id: true, name: true } },
    },
    orderBy: { score: "desc" },
  });

  // Calculate overall score
  const overallScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
    : 0;

  return NextResponse.json({ overallScore, scores });
}

// POST: Recalculate continuity score for a therapist-patient pair
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { therapistId, patientId } = await req.json();
  const tId = therapistId || session.user.id;

  // Gather metrics
  const [
    completedSessions,
    sessionNotes,
    contextViews,
    patientContext,
    totalAppointments,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { therapistId: tId, patientId, status: "COMPLETED" },
    }),
    prisma.sessionNote.findMany({
      where: { therapistId: tId, appointment: { patientId } },
    }),
    prisma.userActivity.count({
      where: { userId: tId, type: "CONTEXT_VIEW", metadata: { contains: patientId } },
    }),
    prisma.patientContext.findUnique({
      where: { patientId_therapistId: { patientId, therapistId: tId } },
    }),
    prisma.appointment.count({
      where: { therapistId: tId, patientId, status: { not: "CANCELLED" } },
    }),
  ]);

  // Calculate sub-scores (0-100 each)
  const noteCompleteness = completedSessions > 0
    ? Math.min(100, (sessionNotes.length / completedSessions) * 100)
    : 0;

  const contextUsage = completedSessions > 0
    ? Math.min(100, (contextViews / completedSessions) * 100)
    : 0;

  // Check how many notes reference previous sessions (follow-up quality)
  const notesWithFollowUp = sessionNotes.filter((n) =>
    n.content.toLowerCase().includes("previous") ||
    n.content.toLowerCase().includes("last session") ||
    n.content.toLowerCase().includes("follow up") ||
    n.content.toLowerCase().includes("as discussed") ||
    n.progress !== null
  ).length;
  const followUpRate = sessionNotes.length > 0
    ? Math.min(100, (notesWithFollowUp / sessionNotes.length) * 100)
    : 0;

  // Patient retention: ratio of completed to total scheduled
  const patientRetention = totalAppointments > 0
    ? Math.min(100, (completedSessions / totalAppointments) * 100)
    : 0;

  // Has context been maintained?
  const contextBonus = patientContext && patientContext.summary.length > 0 ? 15 : 0;

  // Weighted overall score
  const score = Math.min(100, Math.round(
    noteCompleteness * 0.25 +
    contextUsage * 0.25 +
    followUpRate * 0.25 +
    patientRetention * 0.15 +
    contextBonus
  ));

  const result = await prisma.continuityScore.upsert({
    where: { therapistId_patientId: { therapistId: tId, patientId } },
    create: {
      therapistId: tId,
      patientId,
      score,
      noteCompleteness,
      contextUsage,
      followUpRate,
      patientRetention,
    },
    update: {
      score,
      noteCompleteness,
      contextUsage,
      followUpRate,
      patientRetention,
      lastCalculated: new Date(),
    },
  });

  return NextResponse.json(result);
}
