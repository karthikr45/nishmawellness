import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List challenges for an org
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const challenges = await prisma.wellnessChallenge.findMany({
    where: { organizationId: orgId, isActive: true },
    include: { _count: { select: { participants: true } } },
    orderBy: { startDate: "desc" },
  });

  // Get user's participation
  const myParticipation = await prisma.challengeParticipant.findMany({
    where: { userId: session.user.id },
  });
  const myMap = new Map(myParticipation.map((p) => [p.challengeId, p]));

  return NextResponse.json(challenges.map((c) => ({
    ...c,
    participantCount: c._count.participants,
    myProgress: myMap.get(c.id)?.progress || 0,
    joined: myMap.has(c.id),
    isCompleted: myMap.get(c.id)?.isCompleted || false,
  })));
}

// POST: Create challenge (ORG_ADMIN / HR)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const challenge = await prisma.wellnessChallenge.create({
    data: {
      organizationId: body.organizationId,
      title: body.title,
      description: body.description,
      type: body.type || "STEPS",
      target: body.target || 0,
      unit: body.unit || "",
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      prize: body.prize || null,
    },
  });
  return NextResponse.json(challenge);
}

// PATCH: Join or update progress on a challenge
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeId, progress } = await req.json();

  const participant = await prisma.challengeParticipant.upsert({
    where: { challengeId_userId: { challengeId, userId: session.user.id } },
    create: { challengeId, userId: session.user.id, progress: progress || 0 },
    update: { progress, isCompleted: progress >= 100 },
  });

  return NextResponse.json(participant);
}
