import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail, appointmentReminderEmail, welcomeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, data } = await req.json();

  switch (type) {
    case "APPOINTMENT_REMINDER": {
      const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointmentId },
        include: {
          patient: { select: { name: true, email: true } },
          therapist: { select: { name: true } },
        },
      });
      if (!appointment) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

      const email = appointmentReminderEmail(
        appointment.patient.name,
        appointment.therapist.name,
        new Date(appointment.dateTime).toLocaleString()
      );
      await sendEmail({ to: appointment.patient.email, ...email });
      return NextResponse.json({ success: true });
    }

    case "WELCOME": {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true },
      });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const email = welcomeEmail(user.name);
      await sendEmail({ to: user.email, ...email });
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
  }
}
