import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();

  const { searchParams } = new URL(req.url);
  const therapistId = searchParams.get("therapistId");

  const id = therapistId || session?.user?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing therapist ID" }, { status: 400 });
  }

  const availability = await prisma.availability.findMany({
    where: { therapistId: id },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json(availability);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { availability } = await req.json();

  // Delete existing and recreate
  await prisma.availability.deleteMany({
    where: { therapistId: session.user.id },
  });

  const created = await Promise.all(
    availability.map((a: { dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }) =>
      prisma.availability.create({
        data: {
          therapistId: session.user.id,
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          isAvailable: a.isAvailable,
        },
      })
    )
  );

  return NextResponse.json(created);
}
