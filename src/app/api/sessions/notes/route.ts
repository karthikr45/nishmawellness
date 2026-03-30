import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notes = await prisma.sessionNote.findMany({
    where: { therapistId: session.user.id },
    include: {
      appointment: {
        include: {
          patient: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { appointmentId, content, mood, progress, homework } = body;

  const note = await prisma.sessionNote.create({
    data: {
      appointmentId,
      therapistId: session.user.id,
      content,
      mood,
      progress,
      homework,
    },
  });

  return NextResponse.json(note);
}
