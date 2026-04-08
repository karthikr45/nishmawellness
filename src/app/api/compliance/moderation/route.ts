import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get moderation flags (admin/therapist)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "THERAPIST")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "PENDING";

  const flags = await prisma.moderationFlag.findMany({
    where: { status },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const stats = {
    pending: await prisma.moderationFlag.count({ where: { status: "PENDING" } }),
    critical: await prisma.moderationFlag.count({ where: { severity: "CRITICAL", status: "PENDING" } }),
    reviewed: await prisma.moderationFlag.count({ where: { status: "REVIEWED" } }),
  };

  return NextResponse.json({ flags, stats });
}

// PATCH: Update moderation flag status
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "THERAPIST")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status, reviewNotes } = await req.json();

  const flag = await prisma.moderationFlag.update({
    where: { id },
    data: {
      status,
      reviewNotes,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json(flag);
}
