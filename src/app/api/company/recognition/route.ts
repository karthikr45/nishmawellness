import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Peer Recognition
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const recognitions = await prisma.peerRecognition.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Get recipient names (anonymous senders)
  const enriched = await Promise.all(
    recognitions.map(async (r) => {
      const toUser = await prisma.user.findUnique({ where: { id: r.toUserId }, select: { name: true } });
      return { ...r, toName: toUser?.name || "A colleague" };
    })
  );

  // Category stats
  const categories: Record<string, number> = {};
  recognitions.forEach((r) => { categories[r.category] = (categories[r.category] || 0) + 1; });

  return NextResponse.json({ recognitions: enriched, categoryStats: categories, total: recognitions.length });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId, toUserId, message, category, isAnonymous } = await req.json();

  const recognition = await prisma.peerRecognition.create({
    data: {
      organizationId,
      fromUserId: session.user.id,
      toUserId,
      message,
      category: category || "KINDNESS",
      isAnonymous: isAnonymous ?? true,
    },
  });

  // Notify the recipient
  await prisma.notification.create({
    data: {
      userId: toUserId,
      title: "You've Been Recognized!",
      message: `Someone appreciated you: "${message.substring(0, 80)}"`,
      type: "SYSTEM",
    },
  });

  return NextResponse.json(recognition);
}
