import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};

  if (session.user.role === "PATIENT") {
    where.patientId = session.user.id;
  } else if (session.user.role === "THERAPIST") {
    where.therapistId = session.user.id;
  }

  if (status) {
    where.status = status;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { id: true, name: true, email: true, avatar: true } },
      therapist: { select: { id: true, name: true, email: true, avatar: true, specialization: true } },
    },
    orderBy: { dateTime: "asc" },
  });

  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { therapistId, dateTime, duration, type, notes } = body;

  if (!therapistId || !dateTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: session.user.id,
      therapistId,
      dateTime: new Date(dateTime),
      duration: duration || 60,
      type: type || "VIDEO",
      notes,
      status: "SCHEDULED",
      // meetingUrl is the in-app session URL; the actual Jitsi room is
      // derived from the appointment ID inside /video-session/[id].
      meetingUrl: "",
    },
    include: {
      patient: { select: { id: true, name: true, email: true } },
      therapist: { select: { id: true, name: true, email: true } },
    },
  });

  // Now that we have the real id, set the meeting URL to the in-app room.
  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { meetingUrl: `/video-session/${appointment.id}` },
  });
  appointment.meetingUrl = `/video-session/${appointment.id}`;

  // Send confirmation email to patient (no-op if no provider key set)
  try {
    const { sendEmail, appointmentReminderEmail } = await import("@/lib/email");
    const tpl = appointmentReminderEmail(
      appointment.patient.name,
      appointment.therapist.name,
      new Date(appointment.dateTime).toLocaleString()
    );
    await sendEmail({ to: appointment.patient.email, subject: tpl.subject, html: tpl.html });
  } catch (err) {
    console.error("[appointments] email failed:", err);
  }

  // Create notification for therapist
  await prisma.notification.create({
    data: {
      userId: therapistId,
      title: "New Appointment",
      message: `${session.user.name} has booked a session on ${new Date(dateTime).toLocaleDateString()}.`,
      type: "APPOINTMENT",
    },
  });

  return NextResponse.json(appointment);
}
