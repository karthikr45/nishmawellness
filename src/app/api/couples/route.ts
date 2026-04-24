import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: fetch my partnership + partner info + recent check-ins
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const partnership = await prisma.couplePartnership.findFirst({
    where: {
      OR: [{ partnerAId: session.user.id }, { partnerBId: session.user.id }],
      status: { in: ["ACTIVE", "PENDING"] },
    },
    include: {
      partnerA: { select: { id: true, name: true, email: true, avatar: true } },
      partnerB: { select: { id: true, name: true, email: true, avatar: true } },
      checkins: { orderBy: { date: "desc" }, take: 14 },
      journals: {
        where: {
          OR: [
            { type: "SHARED" },
            { userId: session.user.id },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true } } },
      },
    },
  });

  return NextResponse.json(partnership);
}

// POST: invite a partner by email OR accept a pending invite
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // Action: invite
  if (action === "invite") {
    const { partnerEmail, anniversary, loveLanguage } = body;
    if (!partnerEmail) return NextResponse.json({ error: "Partner email is required" }, { status: 400 });

    const partner = await prisma.user.findUnique({ where: { email: partnerEmail } });
    if (!partner) return NextResponse.json({ error: "No account found with that email. They need to sign up first." }, { status: 404 });
    if (partner.id === session.user.id) return NextResponse.json({ error: "You cannot partner with yourself" }, { status: 400 });

    const existing = await prisma.couplePartnership.findFirst({
      where: {
        OR: [
          { partnerAId: session.user.id },
          { partnerBId: session.user.id },
          { partnerAId: partner.id },
          { partnerBId: partner.id },
        ],
        status: { in: ["ACTIVE", "PENDING"] },
      },
    });
    if (existing) return NextResponse.json({ error: "One of you is already in a partnership" }, { status: 409 });

    const partnership = await prisma.couplePartnership.create({
      data: {
        partnerAId: session.user.id,
        partnerBId: partner.id,
        status: "PENDING",
        anniversary: anniversary ? new Date(anniversary) : null,
        loveLanguageA: loveLanguage || null,
      },
    });

    await prisma.notification.create({
      data: {
        userId: partner.id,
        title: "Partner Invite",
        message: `${session.user.name} has invited you to share a Couples Wellness journey together.`,
        type: "SYSTEM",
      },
    });

    return NextResponse.json(partnership);
  }

  // Action: accept
  if (action === "accept") {
    const { partnershipId, loveLanguage } = body;
    const partnership = await prisma.couplePartnership.findUnique({ where: { id: partnershipId } });
    if (!partnership || partnership.partnerBId !== session.user.id) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    const updated = await prisma.couplePartnership.update({
      where: { id: partnershipId },
      data: { status: "ACTIVE", loveLanguageB: loveLanguage || null },
    });

    await prisma.notification.create({
      data: {
        userId: partnership.partnerAId,
        title: "Partner Accepted",
        message: `${session.user.name} accepted your couple wellness invite!`,
        type: "SYSTEM",
      },
    });

    return NextResponse.json(updated);
  }

  // Action: checkin
  if (action === "checkin") {
    const { partnershipId, communication, connection, conflict, gratitudeNote } = body;
    const checkin = await prisma.coupleCheckin.create({
      data: {
        partnershipId,
        userId: session.user.id,
        communication: parseInt(communication),
        connection: parseInt(connection),
        conflict: parseInt(conflict),
        gratitudeNote: gratitudeNote || null,
      },
    });
    return NextResponse.json(checkin);
  }

  // Action: journal
  if (action === "journal") {
    const { partnershipId, content, type, tags } = body;
    const entry = await prisma.coupleJournal.create({
      data: {
        partnershipId,
        userId: session.user.id,
        content,
        type: type || "SHARED",
        tags: JSON.stringify(tags || []),
      },
      include: { user: { select: { name: true } } },
    });
    return NextResponse.json(entry);
  }

  // Action: update (love language, goals, anniversary)
  if (action === "update") {
    const { partnershipId, loveLanguage, sharedGoals, anniversary, communicationStyle } = body;
    const partnership = await prisma.couplePartnership.findUnique({ where: { id: partnershipId } });
    if (!partnership) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isA = partnership.partnerAId === session.user.id;
    const updated = await prisma.couplePartnership.update({
      where: { id: partnershipId },
      data: {
        ...(loveLanguage && isA ? { loveLanguageA: loveLanguage } : {}),
        ...(loveLanguage && !isA ? { loveLanguageB: loveLanguage } : {}),
        ...(sharedGoals ? { sharedGoals: JSON.stringify(sharedGoals) } : {}),
        ...(anniversary ? { anniversary: new Date(anniversary) } : {}),
        ...(communicationStyle ? { communicationStyle } : {}),
      },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
