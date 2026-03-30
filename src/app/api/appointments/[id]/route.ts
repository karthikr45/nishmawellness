import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const appointment = await prisma.appointment.update({
    where: { id },
    data: body,
    include: {
      patient: { select: { id: true, name: true, email: true } },
      therapist: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(appointment);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ message: "Appointment cancelled" });
}
