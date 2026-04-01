import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

// Detect mood/intent from message for avatar facial expression
function detectMood(message: string): string {
  const lower = message.toLowerCase();
  if (lower.match(/anxious|scared|afraid|panic|worry|nervous/)) return "empathetic";
  if (lower.match(/sad|depressed|hopeless|cry|grief|loss/)) return "empathetic";
  if (lower.match(/better|good|great|happy|progress|proud/)) return "encouraging";
  if (lower.match(/think|wonder|maybe|curious|question|how/)) return "thoughtful";
  if (lower.match(/hello|hi|hey|good morning|good evening/)) return "greeting";
  return "neutral";
}

// Generate context-aware response with speaking segments
async function generateAvatarResponse(userId: string, message: string) {
  const lower = message.toLowerCase();

  const [user, memories, recentChats] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.aIMemory.findMany({ where: { userId }, orderBy: { weight: "desc" }, take: 5 }),
    prisma.aIChat.findMany({ where: { userId, role: "user" }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const firstName = user?.name?.split(" ")[0] || "";
  const knownTopics = memories.filter((m) => m.category === "TOPIC").map((m) => m.content);
  const knownCoping = memories.filter((m) => m.category === "COPING").map((m) => m.content);
  const mood = detectMood(message);

  // Generate segmented response for more natural avatar speaking
  let response = "";
  let segments: { text: string; mood: string; pause?: number }[] = [];

  if (lower.match(/hello|hi|hey|good morning|good evening/)) {
    const greeting = `Hello ${firstName}! It's wonderful to see you.`;
    const followUp = knownTopics.length > 0
      ? `Last time we explored some thoughts about ${knownTopics[0].toLowerCase()}. How have things been since then?`
      : `How are you feeling today? Take your time — I'm here to listen.`;

    response = `${greeting} ${followUp}`;
    segments = [
      { text: greeting, mood: "greeting", pause: 500 },
      { text: followUp, mood: "empathetic" },
    ];
  } else if (lower.match(/anxious|anxiety|worried|nervous|panic/)) {
    const ack = `I can hear that you're feeling anxious${firstName ? `, ${firstName}` : ""}.`;
    const validate = `That takes real courage to share, and I want you to know your feelings are completely valid.`;
    const exercise = `Let's try something together right now. Take a slow, deep breath in through your nose... hold it for a moment... and exhale slowly through your mouth.`;
    const followUp = knownCoping.includes("Meditation & Mindfulness")
      ? `I remember mindfulness has helped you before. Would you like to do a quick grounding exercise together?`
      : `Can you tell me what's been triggering these feelings? Understanding the source helps us work through it.`;

    response = `${ack} ${validate} ${exercise} ${followUp}`;
    segments = [
      { text: ack, mood: "empathetic", pause: 800 },
      { text: validate, mood: "empathetic", pause: 500 },
      { text: exercise, mood: "thoughtful", pause: 1000 },
      { text: followUp, mood: "empathetic" },
    ];
  } else if (lower.match(/sad|depressed|down|hopeless|cry/)) {
    const ack = `I'm sorry you're going through this${firstName ? `, ${firstName}` : ""}.`;
    const validate = `Feeling this way is a sign that something important needs attention, and I'm glad you're here talking about it.`;
    const question = `When did these feelings start? Sometimes pinpointing the beginning helps us understand what's happening.`;

    response = `${ack} ${validate} ${question}`;
    segments = [
      { text: ack, mood: "empathetic", pause: 800 },
      { text: validate, mood: "empathetic", pause: 600 },
      { text: question, mood: "thoughtful" },
    ];
  } else if (lower.match(/stress|overwhelm|too much|pressure|burnout/)) {
    const ack = `It sounds like you're carrying a heavy load right now.`;
    const normalize = `Stress affects all of us, and recognizing it is actually the first step toward managing it.`;
    const action = `Let's try to break things down. What are the top two or three things weighing on you the most right now?`;
    const coping = knownCoping.length > 0
      ? `And remember, ${knownCoping[0].toLowerCase()} has been helpful for you in the past.`
      : ``;

    response = `${ack} ${normalize} ${action} ${coping}`;
    segments = [
      { text: ack, mood: "empathetic", pause: 600 },
      { text: normalize, mood: "thoughtful", pause: 500 },
      { text: action, mood: "encouraging", pause: 500 },
      ...(coping ? [{ text: coping, mood: "encouraging" as string }] : []),
    ];
  } else if (lower.match(/better|good|great|happy|progress|proud/)) {
    const celebrate = `That's really wonderful to hear${firstName ? `, ${firstName}` : ""}!`;
    const reinforce = `You should feel proud of the work you've been putting in. Progress isn't always linear, but you're clearly moving in the right direction.`;
    const explore = `What do you think has been contributing to this positive shift? Understanding what works helps us build on it.`;

    response = `${celebrate} ${reinforce} ${explore}`;
    segments = [
      { text: celebrate, mood: "encouraging", pause: 500 },
      { text: reinforce, mood: "encouraging", pause: 500 },
      { text: explore, mood: "thoughtful" },
    ];
  } else if (lower.match(/sleep|tired|insomnia|exhausted/)) {
    const ack = `Sleep challenges can really affect every part of our well-being.`;
    const explore = `Let's talk about your sleep patterns. Have you been maintaining a consistent schedule? What does your wind-down routine look like?`;
    const tip = `One technique that many find helpful is the body scan meditation before bed — it signals your nervous system that it's time to rest.`;

    response = `${ack} ${explore} ${tip}`;
    segments = [
      { text: ack, mood: "empathetic", pause: 500 },
      { text: explore, mood: "thoughtful", pause: 600 },
      { text: tip, mood: "encouraging" },
    ];
  } else if (lower.match(/relationship|partner|family|friend|lonely/)) {
    response = `Relationships are at the core of our emotional well-being${firstName ? `, ${firstName}` : ""}. Tell me more about what's going on. I'm here to listen without judgment, and together we can explore healthy ways to navigate this.`;
    segments = [
      { text: response, mood: "empathetic" },
    ];
  } else if (lower.match(/thank|bye|goodbye|session|end/)) {
    response = `Thank you for sharing with me today${firstName ? `, ${firstName}` : ""}. Remember, every conversation is a step forward on your wellness journey. I'm always here when you need to talk. Take care of yourself.`;
    segments = [
      { text: `Thank you for sharing with me today${firstName ? `, ${firstName}` : ""}.`, mood: "encouraging", pause: 500 },
      { text: `Remember, every conversation is a step forward on your wellness journey.`, mood: "empathetic", pause: 500 },
      { text: `I'm always here when you need to talk. Take care of yourself.`, mood: "greeting" },
    ];
  } else {
    const ack = `Thank you for sharing that${firstName ? `, ${firstName}` : ""}.`;
    const explore = `I want to make sure I understand fully. Can you tell me more about what you're experiencing? The more I understand, the better I can support you.`;

    response = `${ack} ${explore}`;
    segments = [
      { text: ack, mood: "neutral", pause: 500 },
      { text: explore, mood: "thoughtful" },
    ];
  }

  return { response, segments, mood };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, sessionId: existingSessionId } = await req.json();
  const sessionId = existingSessionId || uuid();

  // Save user message
  await prisma.aIChat.create({
    data: { userId: session.user.id, role: "user", content: message, sessionId },
  });

  // Extract and store memories
  const lower = message.toLowerCase();
  const topicPatterns: [RegExp, string][] = [
    [/(?:work|job|boss|career|office)/i, "Work Stress"],
    [/(?:relationship|partner|spouse)/i, "Relationships"],
    [/(?:family|parent|mother|father)/i, "Family"],
    [/(?:anxiety|anxious|panic)/i, "Anxiety"],
    [/(?:depress|sad|hopeless)/i, "Depression"],
    [/(?:sleep|insomnia)/i, "Sleep Issues"],
  ];

  for (const [pattern, topic] of topicPatterns) {
    if (pattern.test(lower)) {
      const existing = await prisma.aIMemory.findFirst({
        where: { userId: session.user.id, category: "TOPIC", content: topic },
      });
      if (existing) {
        await prisma.aIMemory.update({ where: { id: existing.id }, data: { weight: Math.min(existing.weight + 0.5, 5) } });
      } else {
        await prisma.aIMemory.create({
          data: { userId: session.user.id, category: "TOPIC", content: topic, source: "AI_CHAT" },
        });
      }
    }
  }

  // Generate response
  const { response, segments, mood } = await generateAvatarResponse(session.user.id, message);

  // Save AI response
  const aiMessage = await prisma.aIChat.create({
    data: { userId: session.user.id, role: "assistant", content: response, sessionId },
  });

  // Log activity
  await prisma.userActivity.create({
    data: { userId: session.user.id, type: "AVATAR_SESSION", metadata: JSON.stringify({ sessionId }) },
  });

  return NextResponse.json({
    sessionId,
    message: aiMessage,
    segments,
    avatarMood: mood,
  });
}
