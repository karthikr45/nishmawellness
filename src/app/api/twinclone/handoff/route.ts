import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get handoff summaries for therapist
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const handoffs = await prisma.sessionHandoff.findMany({
    where: { therapistId: session.user.id },
    include: {
      patient: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(
    handoffs.map((h) => ({
      ...h,
      keyTopics: JSON.parse(h.keyTopics),
      riskFlags: JSON.parse(h.riskFlags),
      suggestedFocus: JSON.parse(h.suggestedFocus),
    }))
  );
}

// POST: Generate a handoff summary for a patient
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { patientId, appointmentId } = await req.json();

  // Get recent AI chats between this patient and this therapist's clone
  const recentChats = await prisma.aIChat.findMany({
    where: { userId: patientId, therapistId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Get patient's recent progress
  const recentProgress = await prisma.progress.findMany({
    where: { userId: patientId, type: "MOOD" },
    orderBy: { date: "desc" },
    take: 7,
  });

  // Get recent journal entries
  const journals = await prisma.journalEntry.findMany({
    where: { userId: patientId },
    orderBy: { date: "desc" },
    take: 3,
  });

  // Get AI memories
  const memories = await prisma.aIMemory.findMany({
    where: { userId: patientId },
    orderBy: { weight: "desc" },
    take: 10,
  });

  // Analyze chats to extract key topics
  const patientMessages = recentChats.filter((c) => c.role === "user").map((c) => c.content.toLowerCase());
  const topicCounts: Record<string, number> = {};
  const topicKeywords: Record<string, string[]> = {
    "Anxiety & Worry": ["anxious", "anxiety", "worried", "nervous", "panic"],
    "Depression & Mood": ["sad", "depressed", "hopeless", "empty", "down"],
    "Work & Career": ["work", "job", "boss", "career", "office", "burnout"],
    "Relationships": ["relationship", "partner", "spouse", "marriage", "lonely"],
    "Sleep Issues": ["sleep", "insomnia", "tired", "exhausted"],
    "Family": ["family", "parent", "mother", "father", "child"],
    "Self-Esteem": ["confidence", "self-esteem", "worth", "inadequate"],
    "Stress Management": ["stress", "overwhelm", "pressure", "too much"],
  };

  for (const msg of patientMessages) {
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some((k) => msg.includes(k))) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }
  }

  const keyTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);

  // Detect risk flags
  const riskFlags: string[] = [];
  for (const msg of patientMessages) {
    if (msg.match(/suicide|kill.*self|self.?harm|end.*life|die|don't want to live/)) {
      riskFlags.push("Expressed suicidal ideation or self-harm thoughts");
    }
    if (msg.match(/hopeless|no point|give up|can't go on/)) {
      riskFlags.push("Expressed feelings of hopelessness");
    }
    if (msg.match(/substance|drink|alcohol|drug|pills/)) {
      riskFlags.push("Mentioned substance use");
    }
  }

  // Calculate mood trend
  const avgMood = recentProgress.length > 0
    ? Math.round(recentProgress.reduce((s, p) => s + p.value, 0) / recentProgress.length)
    : null;
  const moodTrend = recentProgress.length >= 3
    ? recentProgress[0].value > recentProgress[recentProgress.length - 1].value ? "improving"
      : recentProgress[0].value < recentProgress[recentProgress.length - 1].value ? "declining"
      : "stable"
    : "unknown";

  // Generate suggested focus areas
  const suggestedFocus = keyTopics.slice(0, 3);
  if (riskFlags.length > 0) suggestedFocus.unshift("Risk Assessment - Safety Planning");
  if (moodTrend === "declining") suggestedFocus.push("Mood trend declining - explore contributing factors");

  // Generate summary
  let aiSummary = `Since the last session, the patient has had ${recentChats.length} interactions with your AI TwinClone. `;

  if (keyTopics.length > 0) {
    aiSummary += `Primary topics discussed: ${keyTopics.join(", ")}. `;
  }

  if (avgMood !== null) {
    aiSummary += `Average mood score: ${avgMood}% (${moodTrend}). `;
  }

  if (journals.length > 0) {
    const latestJournal = journals[0];
    aiSummary += `Latest journal entry mood: ${latestJournal.mood}/10. `;
    if (latestJournal.challenge) {
      aiSummary += `Key challenge: "${latestJournal.challenge}". `;
    }
  }

  if (riskFlags.length > 0) {
    aiSummary += `⚠️ RISK FLAGS: ${riskFlags.join("; ")}. `;
  }

  const knownTopics = memories.filter((m) => m.category === "TOPIC").map((m) => m.content);
  if (knownTopics.length > 0) {
    aiSummary += `Ongoing themes: ${knownTopics.join(", ")}.`;
  }

  const handoff = await prisma.sessionHandoff.create({
    data: {
      therapistId: session.user.id,
      patientId,
      appointmentId: appointmentId || null,
      aiSummary,
      keyTopics: JSON.stringify(keyTopics),
      moodTrend,
      riskFlags: JSON.stringify(riskFlags),
      suggestedFocus: JSON.stringify(suggestedFocus),
      chatCount: recentChats.length,
    },
  });

  return NextResponse.json({
    ...handoff,
    keyTopics,
    riskFlags,
    suggestedFocus,
  });
}
