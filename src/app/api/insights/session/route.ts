import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Generate insight card for a specific AI chat session
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const chatSessionId = searchParams.get("sessionId");

  if (!chatSessionId) {
    // Return most recent session insight
    const latestChat = await prisma.aIChat.findFirst({
      where: { userId: session.user.id, role: "user" },
      orderBy: { createdAt: "desc" },
      select: { sessionId: true },
    });
    if (!latestChat) return NextResponse.json(null);
    return generateSessionInsight(session.user.id, latestChat.sessionId);
  }

  return generateSessionInsight(session.user.id, chatSessionId);
}

async function generateSessionInsight(userId: string, chatSessionId: string) {
  const messages = await prisma.aIChat.findMany({
    where: { userId, sessionId: chatSessionId },
    orderBy: { createdAt: "asc" },
  });

  if (messages.length === 0) {
    return NextResponse.json(null);
  }

  const userMessages = messages.filter((m) => m.role === "user");
  const aiMessages = messages.filter((m) => m.role === "assistant");
  const allText = userMessages.map((m) => m.content.toLowerCase()).join(" ");

  // Detect topics discussed
  const topicKeywords: Record<string, string[]> = {
    "Anxiety": ["anxious", "anxiety", "worried", "nervous", "panic", "fear"],
    "Depression": ["sad", "depressed", "hopeless", "empty", "numb", "down"],
    "Stress": ["stress", "overwhelm", "pressure", "burnout", "too much"],
    "Sleep": ["sleep", "insomnia", "tired", "exhausted", "fatigue"],
    "Relationships": ["relationship", "partner", "family", "friend", "lonely"],
    "Self-Esteem": ["confidence", "self-esteem", "worth", "inadequate"],
    "Work": ["work", "job", "boss", "career", "office"],
    "Mindfulness": ["meditat", "mindful", "breathing", "calm", "present"],
    "Grief": ["grief", "loss", "miss", "death", "mourning"],
  };

  const topicsDiscussed: string[] = [];
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some((k) => allText.includes(k))) {
      topicsDiscussed.push(topic);
    }
  }

  // Detect mood from user messages
  let moodScore = 50; // neutral
  const positiveWords = ["better", "good", "great", "happy", "progress", "proud", "hopeful", "calm"];
  const negativeWords = ["terrible", "awful", "hopeless", "worst", "can't", "hate", "scared", "panic"];
  const positiveCount = positiveWords.filter((w) => allText.includes(w)).length;
  const negativeCount = negativeWords.filter((w) => allText.includes(w)).length;
  moodScore = Math.max(10, Math.min(90, 50 + positiveCount * 10 - negativeCount * 10));

  const moodLabel = moodScore >= 70 ? "Positive" : moodScore >= 40 ? "Mixed" : "Low";

  // Detect techniques mentioned/suggested by AI
  const techniqueKeywords: Record<string, string> = {
    "Deep Breathing": "breath",
    "Grounding (5-4-3-2-1)": "5 things you can see",
    "Progressive Muscle Relaxation": "muscle relaxation",
    "Cognitive Reframing": "thought pattern|reframe|cognitive",
    "Mindfulness Meditation": "meditation|mindful",
    "Journaling": "journal|write down",
    "Body Scan": "body scan",
    "Self-Compassion": "self-compassion|kind to yourself",
  };

  const aiText = aiMessages.map((m) => m.content.toLowerCase()).join(" ");
  const techniquesSuggested: string[] = [];
  for (const [technique, pattern] of Object.entries(techniqueKeywords)) {
    if (new RegExp(pattern).test(aiText)) {
      techniquesSuggested.push(technique);
    }
  }

  // Generate action items from AI responses
  const actionItems: string[] = [];
  for (const msg of aiMessages) {
    const content = msg.content.toLowerCase();
    if (content.includes("try") || content.includes("practice") || content.includes("consider")) {
      // Extract the suggestion
      const sentences = msg.content.split(/[.!?]+/);
      for (const s of sentences) {
        if (s.toLowerCase().match(/try|practice|consider|recommend|suggest/)) {
          actionItems.push(s.trim());
          if (actionItems.length >= 3) break;
        }
      }
    }
    if (actionItems.length >= 3) break;
  }

  // Session duration
  const firstMsg = messages[0];
  const lastMsg = messages[messages.length - 1];
  const durationMs = new Date(lastMsg.createdAt).getTime() - new Date(firstMsg.createdAt).getTime();
  const durationMinutes = Math.max(1, Math.round(durationMs / 60000));

  // Engagement score
  const avgMessageLength = userMessages.reduce((s, m) => s + m.content.length, 0) / (userMessages.length || 1);
  const engagementScore = Math.min(100, Math.round(
    (userMessages.length * 10) + (avgMessageLength > 50 ? 20 : 0) + (topicsDiscussed.length * 10) + (durationMinutes * 2)
  ));

  return NextResponse.json({
    sessionId: chatSessionId,
    date: firstMsg.createdAt,
    duration: durationMinutes,
    messageCount: messages.length,
    userMessageCount: userMessages.length,
    topicsDiscussed,
    moodDetected: { score: moodScore, label: moodLabel },
    techniquesSuggested,
    actionItems: actionItems.slice(0, 3),
    engagementScore,
    summary: `You discussed ${topicsDiscussed.length > 0 ? topicsDiscussed.join(", ").toLowerCase() : "various topics"} over a ${durationMinutes}-minute session. Your mood appeared ${moodLabel.toLowerCase()} during the conversation.${techniquesSuggested.length > 0 ? ` Techniques explored: ${techniquesSuggested.join(", ")}.` : ""}`,
  });
}
