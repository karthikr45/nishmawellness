import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get AI chat sessions for therapist to review
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find all AI chat sessions where this therapist's clone was used
  const chatSessions = await prisma.aIChat.findMany({
    where: { therapistId: session.user.id },
    distinct: ["sessionId"],
    orderBy: { createdAt: "desc" },
    select: { sessionId: true, userId: true, createdAt: true },
  });

  // Group and enrich with patient info and review status
  const enriched = await Promise.all(
    chatSessions.map(async (cs) => {
      const [patient, messageCount, lastMessage, review] = await Promise.all([
        prisma.user.findUnique({
          where: { id: cs.userId },
          select: { id: true, name: true, email: true },
        }),
        prisma.aIChat.count({
          where: { sessionId: cs.sessionId },
        }),
        prisma.aIChat.findFirst({
          where: { sessionId: cs.sessionId },
          orderBy: { createdAt: "desc" },
          select: { content: true, role: true, createdAt: true },
        }),
        prisma.twinCloneReview.findFirst({
          where: { sessionId: cs.sessionId, therapistId: session.user.id },
        }),
      ]);

      return {
        sessionId: cs.sessionId,
        patient,
        messageCount,
        lastMessage,
        startedAt: cs.createdAt,
        reviewStatus: review?.status || "PENDING",
        reviewId: review?.id || null,
      };
    })
  );

  return NextResponse.json(enriched);
}

// POST: Submit a review for an AI clone session
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, patientId, status, feedback, accuracy, corrections } = await req.json();

  const twinClone = await prisma.twinCloneProfile.findUnique({
    where: { therapistId: session.user.id },
  });

  if (!twinClone) {
    return NextResponse.json({ error: "TwinClone profile not found" }, { status: 404 });
  }

  const review = await prisma.twinCloneReview.upsert({
    where: { id: sessionId }, // This will fail on first create, so we use create below
    create: {
      twinCloneId: twinClone.id,
      sessionId,
      therapistId: session.user.id,
      patientId,
      status: status || "REVIEWED",
      feedback: feedback || null,
      accuracy: accuracy || null,
      corrections: JSON.stringify(corrections || []),
    },
    update: {
      status: status || "REVIEWED",
      feedback: feedback || null,
      accuracy: accuracy || null,
      corrections: JSON.stringify(corrections || []),
    },
  });

  return NextResponse.json(review);
}
