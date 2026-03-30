import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      avatar: true,
      bio: true,
      specialization: true,
      experience: true,
      hourlyRate: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, phone, bio, specialization, hourlyRate } = body;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(bio !== undefined && { bio }),
      ...(specialization && { specialization }),
      ...(hourlyRate && { hourlyRate: parseFloat(hourlyRate) }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      bio: true,
      specialization: true,
      hourlyRate: true,
    },
  });

  return NextResponse.json(user);
}
