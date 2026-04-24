import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: list my localities OR search all by query
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const myOnly = searchParams.get("my") === "true";

  if (myOnly) {
    const memberships = await prisma.localityMember.findMany({
      where: { userId: session.user.id },
      include: {
        locality: {
          include: {
            _count: { select: { members: true, posts: true, events: true } },
          },
        },
      },
    });
    return NextResponse.json(memberships.map((m) => ({ ...m.locality, myRole: m.role, myDisplayName: m.displayName })));
  }

  // Search
  const where = query
    ? {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { city: { contains: query } },
          { pinCode: { contains: query } },
        ],
      }
    : { isActive: true };

  const localities = await prisma.locality.findMany({
    where,
    include: { _count: { select: { members: true, posts: true, events: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(localities);
}

// POST: create a locality, join one, create a post, or create an event
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // Action: create locality
  if (action === "create") {
    const { name, city, state, country, pinCode, description } = body;
    if (!name || !city) return NextResponse.json({ error: "Name and city are required" }, { status: 400 });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = await prisma.locality.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: "A community with that name already exists" }, { status: 409 });

    const locality = await prisma.locality.create({
      data: {
        name,
        slug,
        city,
        state: state || null,
        country: country || "IN",
        pinCode: pinCode || null,
        description: description || null,
        createdById: session.user.id,
      },
    });

    // Auto-join the creator as ADMIN
    await prisma.localityMember.create({
      data: {
        localityId: locality.id,
        userId: session.user.id,
        role: "ADMIN",
        displayName: session.user.name,
        isAnonymous: false,
      },
    });

    return NextResponse.json(locality);
  }

  // Action: join
  if (action === "join") {
    const { localityId, displayName, isAnonymous } = body;
    const existing = await prisma.localityMember.findUnique({
      where: { localityId_userId: { localityId, userId: session.user.id } },
    });
    if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 });

    const member = await prisma.localityMember.create({
      data: {
        localityId,
        userId: session.user.id,
        displayName: displayName || null,
        isAnonymous: isAnonymous !== false,
      },
    });
    return NextResponse.json(member);
  }

  // Action: post
  if (action === "post") {
    const { localityId, title, content, type, tags, isAnonymous } = body;
    if (!title || !content) return NextResponse.json({ error: "Title and content are required" }, { status: 400 });

    const post = await prisma.localityPost.create({
      data: {
        localityId,
        userId: session.user.id,
        title,
        content,
        type: type || "DISCUSSION",
        tags: JSON.stringify(tags || []),
        isAnonymous: isAnonymous !== false,
      },
      include: { user: { select: { name: true } } },
    });
    return NextResponse.json(post);
  }

  // Action: event
  if (action === "event") {
    const { localityId, title, description, type, location, dateTime, duration, maxParticipants, isFree, isRecurring, recurrence } = body;
    if (!title || !dateTime) return NextResponse.json({ error: "Title and date/time are required" }, { status: 400 });

    const event = await prisma.localityEvent.create({
      data: {
        localityId,
        hostId: session.user.id,
        title,
        description: description || "",
        type: type || "MEETUP",
        location: location || null,
        dateTime: new Date(dateTime),
        duration: duration || 60,
        maxParticipants: maxParticipants || 20,
        isFree: isFree !== false,
        isRecurring: isRecurring || false,
        recurrence: recurrence || null,
      },
      include: { host: { select: { name: true } } },
    });
    return NextResponse.json(event);
  }

  // Action: rsvp
  if (action === "rsvp") {
    const { eventId, status } = body;
    const rsvp = await prisma.localityEventRsvp.upsert({
      where: { eventId_userId: { eventId, userId: session.user.id } },
      create: { eventId, userId: session.user.id, status: status || "GOING" },
      update: { status: status || "GOING" },
    });
    return NextResponse.json(rsvp);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
