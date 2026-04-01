import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get therapist's TwinClone profile
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const therapistId = searchParams.get("therapistId") || session.user.id;

  const profile = await prisma.twinCloneProfile.findUnique({
    where: { therapistId },
    include: {
      therapist: { select: { name: true, specialization: true, bio: true, avatar: true, experience: true } },
    },
  });

  if (!profile) {
    // Return default if therapist hasn't configured yet
    const therapist = await prisma.user.findUnique({
      where: { id: therapistId },
      select: { name: true, specialization: true, bio: true },
    });
    return NextResponse.json({
      therapistId,
      isActive: false,
      personality: "empathetic",
      approach: therapist?.specialization || "",
      greeting: `Hello! I'm the AI wellness assistant modeled after ${therapist?.name || "your therapist"}. How can I support you today?`,
      focusAreas: [],
      sampleResponses: [],
      knowledgeBase: [],
      techniques: [],
      phrases: [],
      therapist,
    });
  }

  return NextResponse.json({
    ...profile,
    focusAreas: JSON.parse(profile.focusAreas),
    sampleResponses: JSON.parse(profile.sampleResponses),
    knowledgeBase: JSON.parse(profile.knowledgeBase),
    techniques: JSON.parse(profile.techniques),
    phrases: JSON.parse(profile.phrases),
  });
}

// POST: Create or update TwinClone profile
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const profile = await prisma.twinCloneProfile.upsert({
    where: { therapistId: session.user.id },
    create: {
      therapistId: session.user.id,
      isActive: body.isActive ?? true,
      personality: body.personality || "empathetic",
      approach: body.approach || "",
      tone: body.tone || "warm",
      greeting: body.greeting || "",
      focusAreas: JSON.stringify(body.focusAreas || []),
      boundaries: body.boundaries || "",
      sampleResponses: JSON.stringify(body.sampleResponses || []),
      knowledgeBase: JSON.stringify(body.knowledgeBase || []),
      techniques: JSON.stringify(body.techniques || []),
      phrases: JSON.stringify(body.phrases || []),
      voiceStyle: body.voiceStyle || "calm",
      avatarStyle: body.avatarStyle || "default",
    },
    update: {
      isActive: body.isActive ?? true,
      personality: body.personality || "empathetic",
      approach: body.approach || "",
      tone: body.tone || "warm",
      greeting: body.greeting || "",
      focusAreas: JSON.stringify(body.focusAreas || []),
      boundaries: body.boundaries || "",
      sampleResponses: JSON.stringify(body.sampleResponses || []),
      knowledgeBase: JSON.stringify(body.knowledgeBase || []),
      techniques: JSON.stringify(body.techniques || []),
      phrases: JSON.stringify(body.phrases || []),
      voiceStyle: body.voiceStyle || "calm",
      avatarStyle: body.avatarStyle || "default",
    },
  });

  return NextResponse.json(profile);
}
