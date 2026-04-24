import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: recent notifications sent by admin (system-wide broadcast history)
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { type: "SYSTEM" },
    distinct: ["title", "message"],
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, title: true, message: true, createdAt: true },
  });

  return NextResponse.json(notifications);
}

// POST: broadcast a notification to a target audience
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, message, target } = await req.json();
  if (!title || !message) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  }

  const where: Record<string, unknown> = { isActive: true };
  if (target === "PATIENT") where.role = "PATIENT";
  else if (target === "THERAPIST") where.role = "THERAPIST";

  const users = await prisma.user.findMany({
    where,
    select: { id: true },
  });

  const data = users.map((u) => ({
    userId: u.id,
    title: String(title).slice(0, 200),
    message: String(message).slice(0, 2000),
    type: "SYSTEM" as const,
  }));

  const result = await prisma.notification.createMany({ data });

  return NextResponse.json({
    ok: true,
    sent: result.count,
    target: target || "ALL",
  });
}
