import { NextRequest, NextResponse } from "next/server";

// Demo request intake for enterprise sales.
// Pilot-stage: logs to server console and returns success.
// When ready, wire to:
//   - Prisma (add a DemoRequest model)
//   - Email (Resend) to notify sales@nishmawellness.com
//   - Slack webhook / CRM
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

    // TODO: persist to DB + notify sales once a DemoRequest model / email is wired.
    console.log("[demo-request]", JSON.stringify(record));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[demo-request] error:", err);
    return NextResponse.json({ error: "Unable to process request" }, { status: 500 });
  }
}
