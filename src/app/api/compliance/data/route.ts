import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get user's data summary for transparency
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [
    chatCount,
    journalCount,
    progressCount,
    assessmentCount,
    exerciseCount,
    messageCount,
    memoryCount,
    appointmentCount,
  ] = await Promise.all([
    prisma.aIChat.count({ where: { userId } }),
    prisma.journalEntry.count({ where: { userId } }),
    prisma.progress.count({ where: { userId } }),
    prisma.assessment.count({ where: { userId } }),
    prisma.exerciseLog.count({ where: { userId } }),
    prisma.message.count({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } }),
    prisma.aIMemory.count({ where: { userId } }),
    prisma.appointment.count({ where: { patientId: userId } }),
  ]);

  const consent = await prisma.aIConsent.findUnique({ where: { userId } });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true, email: true, name: true },
  });

  return NextResponse.json({
    user: { email: user?.email, name: user?.name, memberSince: user?.createdAt },
    consent: consent ? { givenAt: consent.givenAt, type: consent.consentType, version: consent.version } : null,
    dataStored: {
      "AI Chat Messages": chatCount,
      "Journal Entries": journalCount,
      "Progress Records": progressCount,
      "Assessments": assessmentCount,
      "Exercise Logs": exerciseCount,
      "Direct Messages": messageCount,
      "AI Memories (Topics)": memoryCount,
      "Appointments": appointmentCount,
    },
    totalRecords: chatCount + journalCount + progressCount + assessmentCount + exerciseCount + messageCount + memoryCount + appointmentCount,
  });
}

// DELETE: Delete specific data categories or all data
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { category } = await req.json();

  // Audit log the deletion request
  await prisma.auditLog.create({
    data: {
      userId,
      action: "DATA_DELETION",
      category: category || "ALL",
      metadata: JSON.stringify({ requestedAt: new Date() }),
    },
  });

  switch (category) {
    case "ai_chats":
      await prisma.aIChat.deleteMany({ where: { userId } });
      await prisma.aIMemory.deleteMany({ where: { userId } });
      break;
    case "journals":
      await prisma.journalEntry.deleteMany({ where: { userId } });
      break;
    case "progress":
      await prisma.progress.deleteMany({ where: { userId } });
      break;
    case "assessments":
      await prisma.assessment.deleteMany({ where: { userId } });
      break;
    case "ai_memories":
      await prisma.aIMemory.deleteMany({ where: { userId } });
      break;
    case "all":
      await Promise.all([
        prisma.aIChat.deleteMany({ where: { userId } }),
        prisma.aIMemory.deleteMany({ where: { userId } }),
        prisma.journalEntry.deleteMany({ where: { userId } }),
        prisma.progress.deleteMany({ where: { userId } }),
        prisma.assessment.deleteMany({ where: { userId } }),
        prisma.exerciseLog.deleteMany({ where: { userId } }),
        prisma.userActivity.deleteMany({ where: { userId } }),
      ]);
      break;
    default:
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  return NextResponse.json({ success: true, deleted: category });
}
