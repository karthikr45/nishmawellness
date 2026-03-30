import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const where: Record<string, unknown> = {
    status: { in: ["SCHEDULED", "LIVE"] },
    dateTime: { gte: new Date() },
  };
  if (category) where.category = category;

  const sessions = await prisma.groupSession.findMany({
    where,
    include: {
      host: { select: { id: true, name: true, specialization: true, avatar: true } },
      _count: { select: { members: true } },
    },
    orderBy: { dateTime: "asc" },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const groupSession = await prisma.groupSession.create({
    data: {
      title: body.title,
      description: body.description,
      hostId: session.user.id,
      category: body.category,
      dateTime: new Date(body.dateTime),
      duration: body.duration || 60,
      maxParticipants: body.maxParticipants || 20,
      price: body.price || 0,
      isRecurring: body.isRecurring || false,
      recurrence: body.recurrence || null,
      tags: JSON.stringify(body.tags || []),
    },
  });

  return NextResponse.json(groupSession);
}
