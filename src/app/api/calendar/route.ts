import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Generate ICS calendar file for appointments
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const appointmentId = searchParams.get("appointmentId");
  const format = searchParams.get("format") || "ics";

  const where: Record<string, unknown> = {};
  if (session.user.role === "THERAPIST") {
    where.therapistId = session.user.id;
  } else {
    where.patientId = session.user.id;
  }
  if (appointmentId) where.id = appointmentId;
  where.status = { in: ["SCHEDULED", "CONFIRMED"] };

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { name: true, email: true } },
      therapist: { select: { name: true, email: true } },
    },
    orderBy: { dateTime: "asc" },
  });

  if (format === "ics") {
    const events = appointments.map((apt) => {
      const start = new Date(apt.dateTime);
      const end = new Date(start.getTime() + apt.duration * 60000);
      const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      return [
        "BEGIN:VEVENT",
        `DTSTART:${formatDate(start)}`,
        `DTEND:${formatDate(end)}`,
        `SUMMARY:Nishma Wellness - Session with ${session.user.role === "THERAPIST" ? apt.patient.name : apt.therapist.name}`,
        `DESCRIPTION:${apt.type} therapy session via Nishma Wellness`,
        `LOCATION:${apt.meetingUrl || "https://nishmawellness.com"}`,
        `UID:${apt.id}@nishmawellness.com`,
        "STATUS:CONFIRMED",
        `ORGANIZER:mailto:${apt.therapist.email}`,
        `ATTENDEE:mailto:${apt.patient.email}`,
        "END:VEVENT",
      ].join("\r\n");
    });

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Nishma Wellness//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");

    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="nishma-appointments.ics"`,
      },
    });
  }

  // JSON format
  return NextResponse.json(
    appointments.map((apt) => ({
      id: apt.id,
      title: `Session with ${session.user.role === "THERAPIST" ? apt.patient.name : apt.therapist.name}`,
      start: apt.dateTime,
      end: new Date(new Date(apt.dateTime).getTime() + apt.duration * 60000),
      type: apt.type,
      status: apt.status,
    }))
  );
}
