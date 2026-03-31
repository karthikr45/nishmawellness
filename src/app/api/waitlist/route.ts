import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { therapistId } = await req.json();

  // Create a notification for the waitlist
  await prisma.notification.create({
    data: {
      userId: session.user.id,
      title: "Waitlist Registered",
      message: "You've been added to the waitlist. We'll notify you when a slot opens up.",
      type: "SYSTEM",
    },
  });

  // Notify the therapist
  await prisma.notification.create({
    data: {
      userId: therapistId,
      title: "New Waitlist Request",
      message: `${session.user.name} has joined your waitlist.`,
      type: "APPOINTMENT",
    },
  });

  return NextResponse.json({ success: true, message: "Added to waitlist" });
}
