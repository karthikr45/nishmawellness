import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

// Generate response using therapist's TwinClone profile
async function generateTwinCloneResponse(userId: string, therapistId: string, message: string): Promise<string> {
  const lower = message.toLowerCase();

  const [profile, user, memories] = await Promise.all([
    prisma.twinCloneProfile.findUnique({ where: { therapistId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.aIMemory.findMany({ where: { userId }, orderBy: { weight: "desc" }, take: 10 }),
  ]);

  const firstName = user?.name?.split(" ")[0] || "";
  const knownTopics = memories.filter((m) => m.category === "TOPIC").map((m) => m.content);
  const knownCoping = memories.filter((m) => m.category === "COPING").map((m) => m.content);

  // Get clone config
  const greeting = profile?.greeting || "Hello! How can I support you today?";
  const personality = profile?.personality || "empathetic";
  const approach = profile?.approach || "";
  const sampleResponses = profile ? JSON.parse(profile.sampleResponses) as { question: string; answer: string }[] : [];
  const techniques = profile ? JSON.parse(profile.techniques) as string[] : [];
  const phrases = profile ? JSON.parse(profile.phrases) as string[] : [];
  const boundaries = profile?.boundaries || "";

  // Check if message matches any trained sample responses
  for (const sample of sampleResponses) {
    const sampleWords = sample.question.toLowerCase().split(/\s+/);
    const matchCount = sampleWords.filter((w) => lower.includes(w)).length;
    if (matchCount >= sampleWords.length * 0.6) {
      // Personalize the trained response
      let response = sample.answer;
      if (firstName) response = response.replace(/\{name\}/g, firstName);
      return response;
    }
  }

  // Add therapist's signature phrases randomly
  const addPhrase = phrases.length > 0 && Math.random() > 0.6
    ? ` ${phrases[Math.floor(Math.random() * phrases.length)]}`
    : "";

  // Tone adjustment based on personality
  const tonePrefix = personality === "professional" ? "" :
    personality === "casual" ? `Hey${firstName ? ` ${firstName}` : ""}, ` :
    personality === "motivational" ? `${firstName ? `${firstName}, ` : ""}` :
    `${firstName ? `${firstName}, ` : ""}`;

  // Greeting
  if (lower.match(/^(hello|hi|hey|good\s)/)) {
    let g = greeting;
    if (firstName) g = g.replace(/Hello!?/i, `Hello, ${firstName}!`);
    if (knownTopics.length > 0) {
      g += ` I remember we've been exploring ${knownTopics[0].toLowerCase()} together. How have things been going?`;
    }
    return g;
  }

  // Anxiety
  if (lower.match(/anxious|anxiety|worried|nervous|panic/)) {
    let response = `${tonePrefix}I hear that you're experiencing anxiety. That feeling is valid, and I want you to know you're in a safe space.`;
    if (approach.toLowerCase().includes("cbt")) {
      response += " Let's examine the thought pattern behind this anxiety. What specific thought keeps coming up? Often our anxious mind exaggerates threats — together we can evaluate if the thought is realistic.";
    } else if (approach.toLowerCase().includes("mindful")) {
      response += " Let's ground ourselves in the present moment. Notice your breathing without changing it. Feel your feet on the floor. You are here, you are safe.";
    } else {
      response += " Can you tell me more about what's triggering these feelings? Understanding the root helps us work through it together.";
    }
    if (techniques.length > 0) {
      response += ` One technique I often recommend is: ${techniques[Math.floor(Math.random() * techniques.length)]}.`;
    }
    return response + addPhrase;
  }

  // Depression/Sadness
  if (lower.match(/sad|depressed|down|hopeless|empty|numb/)) {
    let response = `${tonePrefix}I'm really sorry you're feeling this way. Depression can make everything feel heavy, but I want you to know — this feeling is not permanent, and you're not alone.`;
    if (knownCoping.length > 0) {
      response += ` I recall that ${knownCoping[0].toLowerCase()} has been helpful for you before. Even a small step in that direction can make a difference.`;
    }
    response += " Can you tell me when these feelings started? Was there a specific event, or has it been gradual?";
    return response + addPhrase;
  }

  // Stress
  if (lower.match(/stress|overwhelm|too much|burnout|pressure/)) {
    let response = `${tonePrefix}It sounds like you're carrying a lot right now.`;
    if (approach.toLowerCase().includes("cbt")) {
      response += " Let's use a structured approach: write down everything stressing you, then rate each from 1-10. We'll tackle the most manageable one first — small wins build momentum.";
    } else {
      response += " Let's try to break this down into manageable pieces. What are the top two things weighing on you the most right now?";
    }
    return response + addPhrase;
  }

  // Sleep
  if (lower.match(/sleep|insomnia|tired|exhausted|fatigue/)) {
    return `${tonePrefix}Sleep is foundational to how we feel. Let's explore your sleep patterns together. Are you having trouble falling asleep, staying asleep, or both? ${techniques.length > 0 ? `I often suggest: ${techniques[0]}.` : "A consistent wind-down routine can make a significant difference."}${addPhrase}`;
  }

  // Positive/Progress
  if (lower.match(/better|good|great|happy|progress|proud|accomplished/)) {
    return `${tonePrefix}That's really wonderful to hear! I'm genuinely happy for you. It's so important to acknowledge and celebrate progress, no matter how small it may seem. What do you think contributed to this positive shift?${addPhrase}`;
  }

  // Relationships
  if (lower.match(/relationship|partner|family|marriage|divorce|lonely/)) {
    return `${tonePrefix}Relationships are so central to our well-being. I'm here to listen without judgment. Can you tell me more about what's happening? Using "I feel" statements when communicating with loved ones can transform those difficult conversations.${addPhrase}`;
  }

  // Thank you / Goodbye
  if (lower.match(/thank|bye|goodbye|end|session/)) {
    return `${tonePrefix}Thank you for sharing with me today. Every conversation is a step forward in your journey. Remember, between our sessions, you can always come back and chat. Take care of yourself.${addPhrase}`;
  }

  // Check boundary violations
  if (boundaries && lower.match(/diagnos|prescri|medicat|suicide|kill|harm/)) {
    if (lower.match(/suicide|kill.*self|self.?harm|end.*life/)) {
      return `I want you to know that what you're feeling matters deeply. If you're having thoughts of harming yourself, please reach out for immediate help: call 988 (Suicide & Crisis Lifeline) or text HOME to 741741. You deserve support right now. ${boundaries}`;
    }
    return `${tonePrefix}I appreciate you bringing this up. As an AI wellness assistant, ${boundaries} I'd recommend discussing this with your therapist directly in your next session for the most appropriate guidance.${addPhrase}`;
  }

  // Default response with therapist personality
  const defaults: Record<string, string> = {
    empathetic: `${tonePrefix}Thank you for sharing that with me. I can sense this is important to you. Can you tell me more about what you're experiencing? I'm here to listen and support you.`,
    professional: `Thank you for bringing this up. Let's explore this systematically. What aspects of this situation are you finding most challenging, and what have you already tried?`,
    casual: `${tonePrefix}thanks for sharing that! Let's dig into this a bit more — what's been on your mind about it? No pressure, just chatting.`,
    motivational: `${tonePrefix}I really appreciate you opening up about this. You're already showing strength by talking about it. Let's work through this together — what feels like the first step you could take?`,
  };

  return (defaults[personality] || defaults.empathetic) + addPhrase;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, sessionId: existingSessionId, therapistId } = await req.json();

  if (!therapistId) {
    return NextResponse.json({ error: "therapistId required" }, { status: 400 });
  }

  const sessionId = existingSessionId || uuid();

  // Save user message
  await prisma.aIChat.create({
    data: {
      userId: session.user.id,
      role: "user",
      content: message,
      sessionId,
      therapistId,
    },
  });

  // Extract memories
  const lower = message.toLowerCase();
  const topicPatterns: [RegExp, string][] = [
    [/(?:work|job|boss|career)/i, "Work Stress"],
    [/(?:relationship|partner|spouse)/i, "Relationships"],
    [/(?:anxiety|anxious|panic)/i, "Anxiety"],
    [/(?:depress|sad|hopeless)/i, "Depression"],
    [/(?:sleep|insomnia)/i, "Sleep Issues"],
    [/(?:family|parent|mother|father)/i, "Family"],
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

  // Generate response using therapist's TwinClone profile
  const aiResponse = await generateTwinCloneResponse(session.user.id, therapistId, message);

  const aiMessage = await prisma.aIChat.create({
    data: {
      userId: session.user.id,
      role: "assistant",
      content: aiResponse,
      sessionId,
      therapistId,
    },
  });

  return NextResponse.json({ sessionId, message: aiMessage });
}
