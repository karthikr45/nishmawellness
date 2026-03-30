import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { groupSessionId } = await req.json();

  const groupSession = await prisma.groupSession.findUnique({
    where: { id: groupSessionId },
    include: { _count: { select: { members: true } } },
  });

  if (!groupSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (groupSession._count.members >= groupSession.maxParticipants) {
    return NextResponse.json({ error: "Session is full" }, { status: 409 });
  }

  const member = await prisma.groupSessionMember.upsert({
    where: { groupSessionId_userId: { groupSessionId, userId: session.user.id } },
    create: { groupSessionId, userId: session.user.id },
    update: { status: "REGISTERED" },
  });

  return NextResponse.json(member);
}
