import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { programId } = await req.json();

  const existing = await prisma.enrollment.findUnique({
    where: { userId_programId: { userId: session.user.id, programId } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
  }

  const enrollment = await prisma.enrollment.create({
    data: { userId: session.user.id, programId },
    include: { program: true },
  });

  return NextResponse.json(enrollment);
}
