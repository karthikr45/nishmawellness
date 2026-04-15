import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, appointmentReminderEmail } from "@/lib/email";

// Sends 24-hour appointment reminders. Designed to be called by an external
// scheduler (Vercel Cron, GitHub Actions, etc.) every 15-60 minutes.
//
// Auth: requires `Authorization: Bearer ${CRON_SECRET}` header.
//   - In Vercel Cron, set CRON_SECRET in env and the deployment platform
//     adds the header automatically.
//   - For local testing: curl -H "Authorization: Bearer dev-secret" \
//     http://localhost:3000/api/cron/appointment-reminders
//   - If CRON_SECRET is unset, the route is open in development only.

export async function GET(req: NextRequest) {
  // ---- Auth gate ----
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") || "";
  const provided = auth.replace(/^Bearer\s+/i, "");
  const isProd = process.env.NODE_ENV === "production";

  if (secret) {
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (isProd) {
    // Force secret in production
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 503 }
    );
  }

  // ---- Find appointments needing a reminder ----
  // Window: dateTime in (now+23h, now+25h)
  const now = new Date();
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: {
      dateTime: { gte: windowStart, lte: windowEnd },
      status: { in: ["SCHEDULED", "CONFIRMED"] },
      reminderSentAt: null,
    },
    include: {
      patient: { select: { id: true, name: true, email: true } },
      therapist: { select: { id: true, name: true, email: true } },
    },
  });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const apt of appointments) {
    const dateTimeStr = new Date(apt.dateTime).toLocaleString();
    try {
      // Patient reminder
      const patientTpl = appointmentReminderEmail(
        apt.patient.name,
        apt.therapist.name,
        dateTimeStr
      );
      await sendEmail({
        to: apt.patient.email,
        subject: patientTpl.subject,
        html: patientTpl.html,
      });

      // Therapist reminder (uses same template, swapped names)
      const therapistTpl = appointmentReminderEmail(
        apt.therapist.name,
        apt.patient.name,
        dateTimeStr
      );
      await sendEmail({
        to: apt.therapist.email,
        subject: `Upcoming session with ${apt.patient.name}`,
        html: therapistTpl.html,
      });

      // Mark as sent (idempotent — won't fire again until next appointment)
      await prisma.appointment.update({
        where: { id: apt.id },
        data: { reminderSentAt: new Date() },
      });

      // Audit log
      await prisma.notification.create({
        data: {
          userId: apt.patientId,
          title: "Appointment reminder sent",
          message: `Reminder for your session with ${apt.therapist.name} on ${dateTimeStr}`,
          type: "APPOINTMENT",
        },
      });

      sent++;
    } catch (err) {
      failed++;
      errors.push(`${apt.id}: ${err instanceof Error ? err.message : String(err)}`);
      console.error(`[cron:reminders] failed for ${apt.id}:`, err);
    }
  }

  return NextResponse.json({
    ok: true,
    checked: appointments.length,
    sent,
    failed,
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    errors: errors.slice(0, 10), // cap response size
  });
}
