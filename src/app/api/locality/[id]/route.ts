import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") || "posts";

  const locality = await prisma.locality.findUnique({
    where: { id },
    include: {
      _count: { select: { members: true, posts: true, events: true } },
      members: { take: 50, include: { user: { select: { name: true, avatar: true } } } },
    },
  });

  if (!locality) return NextResponse.json({ error: "Locality not found" }, { status: 404 });

  const isMember = await prisma.localityMember.findUnique({
    where: { localityId_userId: { localityId: id, userId: session.user.id } },
  });

  if (tab === "events") {
    const events = await prisma.localityEvent.findMany({
      where: { localityId: id, status: { not: "CANCELLED" } },
      include: {
        host: { select: { name: true } },
        _count: { select: { rsvps: true } },
        rsvps: { where: { userId: session.user.id }, take: 1 },
      },
      orderBy: { dateTime: "asc" },
    });
    return NextResponse.json({ locality, isMember: !!isMember, events });
  }

  const posts = await prisma.localityPost.findMany({
    where: { localityId: id },
    include: { user: { select: { name: true } } },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 30,
  });

  // Mask names if anonymous
  const maskedPosts = posts.map((p) => ({
    ...p,
    authorName: p.isAnonymous ? "Community Member" : p.user.name,
    user: undefined,
  }));

  return NextResponse.json({ locality, isMember: !!isMember, posts: maskedPosts });
}
