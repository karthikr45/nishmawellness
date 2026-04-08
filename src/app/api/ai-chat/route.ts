import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";
import { checkMessageSafety } from "@/lib/ai-safety";

// Extract key topics from user messages and store as memories
async function extractAndStoreMemories(userId: string, message: string) {
  const lowerMsg = message.toLowerCase();
  const memories: { category: string; content: string }[] = [];

  // Detect life events
  const eventPatterns = [
    { pattern: /(?:new job|started working|got hired|job change)/i, category: "EVENT" },
    { pattern: /(?:got married|wedding|engaged|engagement)/i, category: "EVENT" },
    { pattern: /(?:baby|pregnant|expecting|child born)/i, category: "EVENT" },
    { pattern: /(?:moved|moving|new house|new apartment|relocated)/i, category: "EVENT" },
    { pattern: /(?:divorced|separation|broke up|breakup)/i, category: "EVENT" },
    { pattern: /(?:lost.*(?:job|parent|friend|pet)|passed away|death|grief|funeral)/i, category: "EVENT" },
    { pattern: /(?:graduated|graduation|degree|school)/i, category: "EVENT" },
    { pattern: /(?:promotion|raise|new role)/i, category: "EVENT" },
  ];

  for (const { pattern, category } of eventPatterns) {
    if (pattern.test(message)) {
      const match = message.match(pattern);
      if (match) {
        memories.push({ category, content: message.substring(0, 200) });
      }
    }
  }

  // Detect ongoing topics
  const topicPatterns = [
    { pattern: /(?:work stress|job stress|boss|coworker|workplace)/i, topic: "Work Stress" },
    { pattern: /(?:relationship|partner|spouse|husband|wife|boyfriend|girlfriend)/i, topic: "Relationships" },
    { pattern: /(?:parent|mother|father|family|sibling)/i, topic: "Family" },
    { pattern: /(?:anxiety|anxious|panic|worried|fear)/i, topic: "Anxiety" },
    { pattern: /(?:depress|sad|hopeless|empty|numb)/i, topic: "Depression" },
    { pattern: /(?:sleep|insomnia|nightmare|tired)/i, topic: "Sleep Issues" },
    { pattern: /(?:self.?esteem|confidence|worth|inadequate)/i, topic: "Self-Esteem" },
    { pattern: /(?:anger|angry|frustrat|irritat)/i, topic: "Anger Management" },
    { pattern: /(?:grief|loss|mourning|miss(?:ing)?.*(?:them|her|him))/i, topic: "Grief" },
    { pattern: /(?:trauma|ptsd|flashback|abuse)/i, topic: "Trauma" },
  ];

  for (const { pattern, topic } of topicPatterns) {
    if (pattern.test(lowerMsg)) {
      memories.push({ category: "TOPIC", content: topic });
    }
  }

  // Detect coping preferences
  const copingPatterns = [
    { pattern: /(?:meditat|mindful|breathing exercise)/i, content: "Meditation & Mindfulness" },
    { pattern: /(?:exercise|workout|gym|running|yoga)/i, content: "Physical Exercise" },
    { pattern: /(?:journal|writing|diary)/i, content: "Journaling" },
    { pattern: /(?:music|listen|play.*instrument)/i, content: "Music" },
    { pattern: /(?:nature|walk|hiking|outdoor)/i, content: "Nature & Outdoors" },
  ];

  for (const { pattern, content } of copingPatterns) {
    if (pattern.test(lowerMsg)) {
      memories.push({ category: "COPING", content });
    }
  }

  // Store extracted memories
  for (const mem of memories) {
    // Check if similar memory exists to avoid duplicates
    const existing = await prisma.aIMemory.findFirst({
      where: { userId, category: mem.category, content: mem.content },
    });

    if (existing) {
      // Boost weight of existing memory
      await prisma.aIMemory.update({
        where: { id: existing.id },
        data: { weight: Math.min(existing.weight + 0.5, 5.0) },
      });
    } else {
      await prisma.aIMemory.create({
        data: {
          userId,
          category: mem.category,
          content: mem.content,
          source: "AI_CHAT",
          weight: 1.0,
        },
      });
    }
  }
}

// Build context-aware AI response using patient history
async function generateContextAwareResponse(userId: string, message: string): Promise<string> {
  const lowerMsg = message.toLowerCase();

  // Fetch user's memories and recent chat history
  const [memories, recentChats, userName, progress] = await Promise.all([
    prisma.aIMemory.findMany({
      where: { userId },
      orderBy: { weight: "desc" },
      take: 10,
    }),
    prisma.aIChat.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    }),
    prisma.progress.findMany({
      where: { userId, type: "MOOD" },
      orderBy: { date: "desc" },
      take: 7,
    }),
  ]);

  const firstName = userName?.name?.split(" ")[0] || "";
  const knownTopics = memories.filter((m) => m.category === "TOPIC").map((m) => m.content);
  const knownEvents = memories.filter((m) => m.category === "EVENT").map((m) => m.content);
  const knownCoping = memories.filter((m) => m.category === "COPING").map((m) => m.content);
  const avgMood = progress.length > 0
    ? Math.round(progress.reduce((s, p) => s + p.value, 0) / progress.length)
    : null;

  // Greeting with context
  if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey") || lowerMsg.match(/^(good\s)?(morning|evening|afternoon)/)) {
    let greeting = `Hello${firstName ? `, ${firstName}` : ""}! It's great to hear from you.`;

    if (knownTopics.length > 0) {
      const recentTopic = knownTopics[0];
      greeting += ` Last time we talked about ${recentTopic.toLowerCase()}. How have things been going with that?`;
    } else {
      greeting += " How are you feeling today? I'm here to listen and support you.";
    }

    if (avgMood !== null && avgMood < 60) {
      greeting += " I noticed your mood scores have been a bit low recently. I want you to know it's okay to not be okay, and I'm here for you.";
    } else if (avgMood !== null && avgMood >= 80) {
      greeting += " I've noticed your mood has been positive lately — that's wonderful!";
    }

    return greeting;
  }

  // Context-aware responses based on known topics
  if (lowerMsg.includes("anxious") || lowerMsg.includes("anxiety") || lowerMsg.includes("worried")) {
    let response = "";
    if (knownTopics.includes("Anxiety")) {
      response = `${firstName ? firstName + ", I" : "I"} remember anxiety has been something we've been working on together. `;
      if (knownCoping.includes("Meditation & Mindfulness")) {
        response += "Have you been able to use the breathing and mindfulness techniques we discussed? Sometimes when anxiety spikes, returning to what's worked before can be grounding. ";
      }
      if (knownCoping.includes("Physical Exercise")) {
        response += "Also, I know exercise has helped you before — even a short walk can help ease anxious feelings. ";
      }
      response += "Can you tell me what's specifically triggering the anxiety right now? Understanding the trigger helps us respond more effectively.";
    } else {
      response = `Thank you for sharing that with me${firstName ? `, ${firstName}` : ""}. Anxiety is something many people experience, and I want you to know it's valid. Let's try the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste. This can help bring you back to the present moment. What's been triggering these anxious feelings?`;
    }
    return response;
  }

  if (lowerMsg.includes("sad") || lowerMsg.includes("depressed") || lowerMsg.includes("down") || lowerMsg.includes("hopeless")) {
    let response = `I hear you${firstName ? `, ${firstName}` : ""}, and I'm sorry you're feeling this way. `;
    if (knownEvents.length > 0) {
      response += `I know you've been going through some significant changes recently. It's completely natural for these feelings to surface during transitions. `;
    }
    if (knownCoping.length > 0) {
      response += `In the past, ${knownCoping[0].toLowerCase()} has been helpful for you. Even a small step in that direction can make a difference. `;
    }
    response += "Can you tell me more about what's been weighing on you? Sometimes just putting feelings into words can lighten the load.";
    return response;
  }

  if (lowerMsg.includes("stress") || lowerMsg.includes("overwhelm") || lowerMsg.includes("too much")) {
    let response = `I understand you're feeling overwhelmed${firstName ? `, ${firstName}` : ""}. `;
    if (knownTopics.includes("Work Stress")) {
      response += "We've talked about work stress before. Is this related to the same situation, or is something new coming up? ";
    }
    response += "Let's try to break this down. Can you identify the top 2-3 things causing the most stress right now? Sometimes naming our stressors helps us feel more in control.";
    if (knownCoping.includes("Nature & Outdoors")) {
      response += " And remember, you mentioned that being in nature helps you reset — could you take even a 10-minute walk today?";
    }
    return response;
  }

  if (lowerMsg.includes("sleep") || lowerMsg.includes("insomnia") || lowerMsg.includes("tired")) {
    let response = "";
    if (knownTopics.includes("Sleep Issues")) {
      response = `${firstName ? firstName + ", sleep" : "Sleep"} difficulties have been an ongoing theme for us. Have you been able to maintain that consistent sleep schedule we talked about? `;
      if (knownCoping.includes("Meditation & Mindfulness")) {
        response += "The bedtime meditation practice might help — even 5 minutes of body scanning before sleep can signal your body to relax. ";
      }
    } else {
      response = `Sleep is so foundational to how we feel${firstName ? `, ${firstName}` : ""}. Let's talk about your sleep habits. Are you maintaining a consistent schedule? Avoiding screens before bed? `;
    }
    response += "Tell me more about what's happening with your sleep.";
    return response;
  }

  if (lowerMsg.includes("relationship") || lowerMsg.includes("partner") || lowerMsg.includes("family")) {
    let response = "";
    if (knownTopics.includes("Relationships") || knownTopics.includes("Family")) {
      response = `${firstName ? firstName + ", I" : "I"} remember relationships/family dynamics have been important to our conversations. What's been happening on that front? Using "I feel" statements can help express your needs without putting others on the defensive.`;
    } else {
      response = `Relationships are so central to our well-being${firstName ? `, ${firstName}` : ""}. Tell me more about what's going on. I'm here to help you work through this.`;
    }
    return response;
  }

  if (lowerMsg.includes("meditation") || lowerMsg.includes("mindful") || lowerMsg.includes("meditate")) {
    return `Great that you're interested in mindfulness${firstName ? `, ${firstName}` : ""}! ${knownCoping.includes("Meditation & Mindfulness") ? "Since meditation has been helpful for you before, " : ""}here's a simple practice: Find a comfortable position, close your eyes, and focus on your breath for 5 minutes. When your mind wanders, gently bring attention back. Would you like me to guide you through a specific technique?`;
  }

  if (lowerMsg.includes("exercise") || lowerMsg.includes("workout") || lowerMsg.includes("fitness")) {
    return `Exercise is one of the most powerful mood boosters${firstName ? `, ${firstName}` : ""}! ${knownCoping.includes("Physical Exercise") ? "I know physical activity has been a great coping tool for you. " : ""}Even 20 minutes of moderate activity releases endorphins. What type of movement feels right for you today?`;
  }

  if (lowerMsg.includes("thank")) {
    return `You're very welcome${firstName ? `, ${firstName}` : ""}! Remember, showing up for yourself like this is a sign of real strength. I'm always here when you need to talk. Is there anything else on your mind?`;
  }

  if (lowerMsg.includes("better") || lowerMsg.includes("good") || lowerMsg.includes("great") || lowerMsg.includes("happy")) {
    return `That's really wonderful to hear${firstName ? `, ${firstName}` : ""}! ${avgMood !== null && avgMood >= 70 ? "I can see your mood scores have been reflecting this positive trend too. " : ""}What do you think has been contributing to feeling better? Understanding what works helps us do more of it.`;
  }

  // Default context-aware response
  let defaultResponse = `Thank you for sharing that${firstName ? `, ${firstName}` : ""}. `;
  if (knownTopics.length > 0 && recentChats.length > 2) {
    defaultResponse += "I've been thinking about what you've shared in our conversations. ";
  }
  defaultResponse += "Can you tell me more about what you're experiencing? The more I understand, the better I can support you.";

  if (avgMood !== null && avgMood < 50) {
    defaultResponse += " And remember, it's okay to take things one step at a time. You don't have to have everything figured out.";
  }

  return defaultResponse;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (sessionId) {
    const messages = await prisma.aIChat.findMany({
      where: { userId: session.user.id, sessionId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
  }

  const sessions = await prisma.aIChat.findMany({
    where: { userId: session.user.id },
    distinct: ["sessionId"],
    orderBy: { createdAt: "desc" },
    select: { sessionId: true, createdAt: true, content: true },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, sessionId: existingSessionId } = await req.json();
  const sessionId = existingSessionId || uuid();

  // Check user profile for minor status
  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { familyRole: true },
  });
  const isMinor = userProfile?.familyRole === "CHILD";

  // ========== SAFETY CHECK ==========
  const safetyResult = checkMessageSafety(message, { isMinor });

  // Audit log every message
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      sessionId,
      action: safetyResult.redirectResponse ? "SAFETY_REDIRECT" : "NORMAL",
      category: safetyResult.category || null,
      severity: safetyResult.severity || null,
      messageSnippet: message.substring(0, 200),
      metadata: JSON.stringify({ flags: safetyResult.flags }),
    },
  });

  // Create moderation flag for HIGH/CRITICAL severity
  if (safetyResult.severity === "HIGH" || safetyResult.severity === "CRITICAL") {
    await prisma.moderationFlag.create({
      data: {
        userId: session.user.id,
        sessionId,
        reason: safetyResult.category || "UNKNOWN",
        severity: safetyResult.severity,
        messageSnippet: message.substring(0, 200),
      },
    });
  }

  // Save user message
  await prisma.aIChat.create({
    data: {
      userId: session.user.id,
      role: "user",
      content: message,
      sessionId,
    },
  });

  // If safety check provides a redirect response, use that instead of AI
  let aiResponse: string;
  if (safetyResult.redirectResponse) {
    aiResponse = safetyResult.redirectResponse;
  } else {
    // Extract memories from user message (runs in background)
    extractAndStoreMemories(session.user.id, message).catch(console.error);
    // Generate context-aware AI response
    aiResponse = await generateContextAwareResponse(session.user.id, message);
  }

  // Log activity
  await prisma.userActivity.create({
    data: {
      userId: session.user.id,
      type: "CHAT",
      metadata: JSON.stringify({ sessionId, safety: safetyResult.category }),
    },
  });

  const aiMessage = await prisma.aIChat.create({
    data: {
      userId: session.user.id,
      role: "assistant",
      content: aiResponse,
      sessionId,
    },
  });

  return NextResponse.json({ sessionId, message: aiMessage, safetyFlag: safetyResult.category || null });
}
