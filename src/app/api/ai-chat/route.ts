import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

// AI response generator - simulates an AI therapist
function generateAIResponse(message: string): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("anxious") || lowerMsg.includes("anxiety") || lowerMsg.includes("worried") || lowerMsg.includes("nervous")) {
    const responses = [
      "I hear that you're experiencing anxiety. That's a very common feeling, and I want you to know it's valid. Let's try a grounding exercise: Can you name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste? This 5-4-3-2-1 technique can help bring you back to the present moment.",
      "Anxiety can feel overwhelming, but remember - these feelings are temporary. Let's work through this together. First, try taking 3 deep breaths: inhale for 4 counts, hold for 7, exhale for 8. This activates your body's relaxation response. How does that feel?",
      "Thank you for sharing that with me. Anxiety often comes from our mind trying to protect us from perceived threats. Let's explore what's triggering these feelings. Can you tell me more about what specific situations are making you feel anxious?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (lowerMsg.includes("sad") || lowerMsg.includes("depressed") || lowerMsg.includes("down") || lowerMsg.includes("hopeless")) {
    const responses = [
      "I'm sorry you're feeling this way. It takes courage to acknowledge these feelings. Remember that sadness is a natural human emotion, and it's okay to not be okay sometimes. Can you tell me - when did these feelings start? Have there been any recent changes in your life?",
      "I want you to know that you're not alone in this. Depression can make everything feel heavy, but small steps can make a big difference. Have you been able to do anything that usually brings you joy recently? Even something small like a walk or listening to music?",
      "Your feelings are valid and important. Let's work together on a plan. Sometimes when we feel down, our routine can help anchor us. Can you tell me about your daily routine? We can look for small positive changes together.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (lowerMsg.includes("stress") || lowerMsg.includes("overwhelm") || lowerMsg.includes("too much") || lowerMsg.includes("pressure")) {
    const responses = [
      "It sounds like you're dealing with a lot of stress. Let's try to break things down into manageable pieces. Can you identify the top 3 things causing you the most stress right now? Sometimes just naming our stressors can help us feel more in control.",
      "Stress is your body's way of responding to demands. While some stress is normal, chronic stress needs attention. Let's try a progressive muscle relaxation: Start by tensing your toes for 5 seconds, then release. Move up through each muscle group. This can help release physical tension.",
      "I understand you're feeling overwhelmed. Let's practice a technique called 'brain dumping' - write down everything that's on your mind without organizing it. Then we can categorize items by urgency and importance. Would you like to try that?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (lowerMsg.includes("sleep") || lowerMsg.includes("insomnia") || lowerMsg.includes("tired") || lowerMsg.includes("fatigue")) {
    const responses = [
      "Sleep difficulties can significantly impact our well-being. Let's talk about your sleep hygiene. Some key practices include: maintaining a consistent sleep schedule, avoiding screens 1 hour before bed, keeping your room cool and dark, and trying relaxation techniques before sleep. Which of these do you currently practice?",
      "Poor sleep and mental health often create a cycle that reinforces each other. A technique that might help is called 'sleep restriction' - it sounds counterintuitive, but limiting time in bed to actual sleep time can improve sleep quality. Would you like me to explain more?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey") || lowerMsg.includes("good morning") || lowerMsg.includes("good evening")) {
    return "Hello! Welcome to your AI wellness session. I'm here to support you on your wellness journey. How are you feeling today? Feel free to share whatever is on your mind - this is a safe and confidential space.";
  }

  if (lowerMsg.includes("meditation") || lowerMsg.includes("meditate") || lowerMsg.includes("mindful")) {
    return "Meditation is a wonderful practice for mental wellness! Here's a simple technique to get started: Find a comfortable seated position, close your eyes, and focus on your breath. When your mind wanders (and it will - that's normal!), gently bring your attention back to your breath. Start with just 5 minutes and gradually increase. Would you like me to guide you through a specific meditation practice?";
  }

  if (lowerMsg.includes("relationship") || lowerMsg.includes("partner") || lowerMsg.includes("family") || lowerMsg.includes("friend")) {
    return "Relationships are a fundamental part of our well-being. It sounds like there may be something on your mind regarding your relationships. Healthy communication is key - using 'I feel' statements instead of 'you always/never' can transform conversations. Can you tell me more about what's going on?";
  }

  if (lowerMsg.includes("thank")) {
    return "You're welcome! Remember, seeking support is a sign of strength, not weakness. I'm here whenever you need to talk. Is there anything else you'd like to explore today?";
  }

  if (lowerMsg.includes("exercise") || lowerMsg.includes("workout") || lowerMsg.includes("fitness")) {
    return "Exercise is one of the most powerful tools for mental health! Even 20-30 minutes of moderate activity can boost mood through endorphin release. The key is finding activities you enjoy - walking, dancing, yoga, or swimming all count. What types of physical activity do you enjoy or would like to try?";
  }

  // Default supportive responses
  const defaults = [
    "Thank you for sharing that with me. I want to make sure I understand you fully. Can you tell me more about what you're experiencing? The more details you share, the better I can support you.",
    "I appreciate you opening up. Let's explore this together. What emotions come up for you when you think about this situation? Understanding our feelings is the first step toward managing them.",
    "That's an important observation. Self-awareness is a key part of wellness. Let's dig deeper into this. What do you think might be contributing to these feelings? Sometimes identifying root causes can be very helpful.",
    "I'm here to support you through this. Let's think about what coping strategies might work for you. Have you tried any techniques in the past that have been helpful? We can build on what's worked before.",
  ];

  return defaults[Math.floor(Math.random() * defaults.length)];
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

  // Get unique sessions
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

  // Save user message
  await prisma.aIChat.create({
    data: {
      userId: session.user.id,
      role: "user",
      content: message,
      sessionId,
    },
  });

  // Generate AI response
  const aiResponse = generateAIResponse(message);

  // Save AI response
  const aiMessage = await prisma.aIChat.create({
    data: {
      userId: session.user.id,
      role: "assistant",
      content: aiResponse,
      sessionId,
    },
  });

  return NextResponse.json({
    sessionId,
    message: aiMessage,
  });
}
