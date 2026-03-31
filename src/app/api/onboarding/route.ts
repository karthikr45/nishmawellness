import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await prisma.onboardingResponse.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const response = await prisma.onboardingResponse.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      responses: JSON.stringify(body.responses || {}),
      primaryGoals: JSON.stringify(body.primaryGoals || []),
      stressLevel: body.stressLevel || null,
      sleepQuality: body.sleepQuality || null,
      exerciseFreq: body.exerciseFreq || null,
      therapyHistory: body.therapyHistory || null,
      preferredStyle: body.preferredStyle || null,
      concerns: JSON.stringify(body.concerns || []),
      emergencyContact: body.emergencyContact ? JSON.stringify(body.emergencyContact) : null,
    },
    update: {
      responses: JSON.stringify(body.responses || {}),
      primaryGoals: JSON.stringify(body.primaryGoals || []),
      stressLevel: body.stressLevel || null,
      sleepQuality: body.sleepQuality || null,
      exerciseFreq: body.exerciseFreq || null,
      therapyHistory: body.therapyHistory || null,
      preferredStyle: body.preferredStyle || null,
      concerns: JSON.stringify(body.concerns || []),
      emergencyContact: body.emergencyContact ? JSON.stringify(body.emergencyContact) : null,
    },
  });

  // Mark user as onboarded
  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingDone: true },
  });

  // Log initial progress entries
  if (body.stressLevel) {
    await prisma.progress.create({
      data: { userId: session.user.id, type: "MOOD", value: Math.max(0, 100 - body.stressLevel * 10) },
    });
  }
  if (body.sleepQuality) {
    await prisma.progress.create({
      data: { userId: session.user.id, type: "SLEEP", value: body.sleepQuality * 10 },
    });
  }

  return NextResponse.json(response);
}
