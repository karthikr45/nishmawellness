import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Retrieve patient context brief for a therapist before a session
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json({ error: "patientId required" }, { status: 400 });
  }

  // Get or create patient context
  let context = await prisma.patientContext.findUnique({
    where: {
      patientId_therapistId: {
        patientId,
        therapistId: session.user.id,
      },
    },
  });

  // Fetch all supporting data for the brief
  const [
    patient,
    recentNotes,
    recentProgress,
    upcomingAppointments,
    pastAppointments,
    recentAIChats,
    enrollments,
    aiMemories,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, name: true, email: true, phone: true, createdAt: true, lastLoginAt: true },
    }),
    prisma.sessionNote.findMany({
      where: { therapistId: session.user.id, appointment: { patientId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { appointment: { select: { dateTime: true } } },
    }),
    prisma.progress.findMany({
      where: { userId: patientId },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.appointment.findMany({
      where: { patientId, therapistId: session.user.id, status: { in: ["SCHEDULED", "CONFIRMED"] } },
      orderBy: { dateTime: "asc" },
      take: 3,
    }),
    prisma.appointment.findMany({
      where: { patientId, therapistId: session.user.id, status: "COMPLETED" },
      orderBy: { dateTime: "desc" },
      take: 10,
    }),
    prisma.aIChat.findMany({
      where: { userId: patientId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.enrollment.findMany({
      where: { userId: patientId },
      include: { program: { select: { title: true, category: true } } },
    }),
    prisma.aIMemory.findMany({
      where: { userId: patientId },
      orderBy: { weight: "desc" },
      take: 20,
    }),
  ]);

  // Calculate mood trend from recent progress
  const moodRecords = recentProgress.filter((p) => p.type === "MOOD");
  const moodTrend = moodRecords.length >= 2
    ? moodRecords[0].value - moodRecords[moodRecords.length - 1].value
    : 0;
  const avgMood = moodRecords.length > 0
    ? Math.round(moodRecords.reduce((s, r) => s + r.value, 0) / moodRecords.length)
    : null;

  // Calculate days since last session
  const lastSession = pastAppointments[0];
  const daysSinceLastSession = lastSession
    ? Math.floor((Date.now() - new Date(lastSession.dateTime).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Extract recent AI chat themes (last few messages from patient)
  const recentPatientMessages = recentAIChats
    .filter((c) => c.role === "user")
    .slice(0, 5)
    .map((c) => c.content);

  // Track that therapist viewed the context (for continuity scoring)
  await prisma.userActivity.create({
    data: {
      userId: session.user.id,
      type: "CONTEXT_VIEW",
      metadata: JSON.stringify({ patientId }),
    },
  });

  const brief = {
    patient,
    context: context ? {
      keyTopics: JSON.parse(context.keyTopics),
      lifeEvents: JSON.parse(context.lifeEvents),
      copingTools: JSON.parse(context.copingTools),
      triggers: JSON.parse(context.triggers),
      preferences: JSON.parse(context.preferences),
      summary: context.summary,
    } : null,
    sessionHistory: {
      totalSessions: pastAppointments.length,
      daysSinceLastSession,
      lastSessionDate: lastSession?.dateTime || null,
    },
    recentNotes: recentNotes.map((n) => ({
      date: n.appointment.dateTime,
      content: n.content,
      mood: n.mood,
      progress: n.progress,
      homework: n.homework,
    })),
    wellnessSnapshot: {
      avgMood,
      moodTrend: moodTrend > 0 ? "improving" : moodTrend < 0 ? "declining" : "stable",
      recentSleep: recentProgress.filter((p) => p.type === "SLEEP").slice(0, 7),
      recentExercise: recentProgress.filter((p) => p.type === "EXERCISE").slice(0, 7),
    },
    activePrograms: enrollments.map((e) => ({
      title: e.program.title,
      category: e.program.category,
      progress: e.progress,
      status: e.status,
    })),
    aiInsights: {
      recentChatThemes: recentPatientMessages,
      memories: aiMemories.map((m) => ({
        category: m.category,
        content: m.content,
        source: m.source,
      })),
    },
    upcomingAppointments,
  };

  return NextResponse.json(brief);
}

// POST: Update patient context (therapist adds notes/observations)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { patientId, keyTopics, lifeEvents, copingTools, triggers, preferences, summary } = body;

  const context = await prisma.patientContext.upsert({
    where: {
      patientId_therapistId: {
        patientId,
        therapistId: session.user.id,
      },
    },
    create: {
      patientId,
      therapistId: session.user.id,
      keyTopics: JSON.stringify(keyTopics || []),
      lifeEvents: JSON.stringify(lifeEvents || []),
      copingTools: JSON.stringify(copingTools || []),
      triggers: JSON.stringify(triggers || []),
      preferences: JSON.stringify(preferences || []),
      summary: summary || "",
    },
    update: {
      ...(keyTopics && { keyTopics: JSON.stringify(keyTopics) }),
      ...(lifeEvents && { lifeEvents: JSON.stringify(lifeEvents) }),
      ...(copingTools && { copingTools: JSON.stringify(copingTools) }),
      ...(triggers && { triggers: JSON.stringify(triggers) }),
      ...(preferences && { preferences: JSON.stringify(preferences) }),
      ...(summary !== undefined && { summary }),
      lastUpdated: new Date(),
    },
  });

  return NextResponse.json(context);
}
