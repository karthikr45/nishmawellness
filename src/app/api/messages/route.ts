import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const otherUserId = searchParams.get("userId");

  if (otherUserId) {
    // Get conversation with specific user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark as read
    await prisma.message.updateMany({
      where: { senderId: otherUserId, receiverId: session.user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json(messages);
  }

  // Get conversation list
  const sentMessages = await prisma.message.findMany({
    where: { senderId: session.user.id },
    select: { receiverId: true },
    distinct: ["receiverId"],
  });

  const receivedMessages = await prisma.message.findMany({
    where: { receiverId: session.user.id },
    select: { senderId: true },
    distinct: ["senderId"],
  });

  const contactIds = [...new Set([
    ...sentMessages.map((m) => m.receiverId),
    ...receivedMessages.map((m) => m.senderId),
  ])];

  const contacts = await Promise.all(
    contactIds.map(async (contactId) => {
      const user = await prisma.user.findUnique({
        where: { id: contactId },
        select: { id: true, name: true, role: true, avatar: true },
      });

      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: contactId },
            { senderId: contactId, receiverId: session.user.id },
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      const unreadCount = await prisma.message.count({
        where: { senderId: contactId, receiverId: session.user.id, isRead: false },
      });

      return { user, lastMessage, unreadCount };
    })
  );

  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { receiverId, content } = await req.json();

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      receiverId,
      content,
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  return NextResponse.json(message);
}
