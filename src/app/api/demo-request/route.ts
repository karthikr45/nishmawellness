import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

// Demo request intake for enterprise sales.
// Pilot-stage: logs to server console + sends confirmation email if Resend
// is configured + (optional) notifies sales@ if SALES_NOTIFICATION_EMAIL is set.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, role, employees, message } = body || {};

    if (!name || !email || !company || !role || !employees) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const record = {
      receivedAt: new Date().toISOString(),
      name: String(name).slice(0, 200),
      email: String(email).slice(0, 200),
      company: String(company).slice(0, 200),
      role: String(role).slice(0, 200),
      employees: String(employees).slice(0, 200),
      message: String(message || "").slice(0, 2000),
    };

    console.log("[demo-request]", JSON.stringify(record));

    // Confirmation email to the requester (no-op if Resend key not set)
    const firstName = record.name.split(" ")[0] || record.name;
    await sendEmail({
      to: record.email,
      subject: "We received your Nishma Wellness demo request",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6690f5, #8560d4); padding: 30px; border-radius: 16px; text-align: center; color: white;">
            <h1 style="margin: 0;">Thanks, ${firstName}.</h1>
          </div>
          <div style="padding: 30px 0;">
            <p>We received your demo request for <strong>${record.company}</strong>.</p>
            <p>One of our team will reach out within <strong>one business day</strong> to schedule a 30-minute walkthrough tailored to your team.</p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">If you need to reach us sooner, just reply to this email.</p>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 12px;">
            <p>Nishma Wellness &middot; Founded by Sesha Sai Nishma Kurapati &amp; Karthik Reddycharla &middot; Powered by MK Tech Monk</p>
          </div>
        </div>
      `,
    });

    // Optional: notify internal sales inbox
    const salesInbox = process.env.SALES_NOTIFICATION_EMAIL;
    if (salesInbox) {
      await sendEmail({
        to: salesInbox,
        subject: `[Demo Request] ${record.company} — ${record.name}`,
        html: `
          <h2>New demo request</h2>
          <ul>
            <li><strong>Name:</strong> ${record.name}</li>
            <li><strong>Email:</strong> ${record.email}</li>
            <li><strong>Company:</strong> ${record.company}</li>
            <li><strong>Role:</strong> ${record.role}</li>
            <li><strong>Team size:</strong> ${record.employees}</li>
          </ul>
          <p><strong>Message:</strong></p>
          <p>${record.message ? record.message.replace(/\n/g, "<br>") : "<em>(none)</em>"}</p>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[demo-request] error:", err);
    return NextResponse.json({ error: "Unable to process request" }, { status: 500 });
  }
}
