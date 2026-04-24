import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("q");

  const where: Record<string, unknown> = {};
  if (category && category !== "All") where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const posts = await prisma.forumPost.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const masked = posts.map((p) => ({
    id: p.id,
    category: p.category,
    title: p.title,
    content: p.content,
    tags: p.tags,
    likes: p.likes,
    isAnonymous: p.isAnonymous,
    author: p.isAnonymous ? (p.displayName || "Community Member") : p.user.name,
    avatar: p.isAnonymous
      ? (p.displayName || "CM").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
      : p.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    createdAt: p.createdAt,
    isOwn: p.userId === session.user.id,
  }));

  return NextResponse.json(masked);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === "create") {
    const { title, content, category, tags, isAnonymous, displayName } = body;
    if (!title || !content) return NextResponse.json({ error: "Title and content required" }, { status: 400 });

    const post = await prisma.forumPost.create({
      data: {
        userId: session.user.id,
        title: String(title).slice(0, 500),
        content: String(content).slice(0, 5000),
        category: category || "General",
        tags: JSON.stringify(tags || []),
        isAnonymous: isAnonymous !== false,
        displayName: isAnonymous !== false ? (displayName || null) : null,
      },
    });
    return NextResponse.json(post);
  }

  if (action === "like") {
    const { postId } = body;
    await prisma.forumPost.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
