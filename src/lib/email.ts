// Email service: Resend with graceful fallback to console logging.
// Set RESEND_API_KEY in .env to enable actual sending.
// Set EMAIL_FROM (e.g. "Nishma Wellness <onboarding@resend.dev>") to override sender.

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const DEFAULT_FROM = "Nishma Wellness <onboarding@resend.dev>";

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  const sender = from || process.env.EMAIL_FROM || DEFAULT_FROM;

  // No API key → log to console (safe dev/pilot fallback).
  if (!apiKey) {
    console.log(`\n📧 [email:console] to=${to} subject="${subject}"`);
    console.log(`   ${html.substring(0, 120).replace(/\s+/g, " ")}...`);
    return { success: true, messageId: `console-${Date.now()}` };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from: sender, to, subject, html }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[email:resend] ${res.status} ${text}`);
      return { success: false, messageId: null, error: text };
    }

    const data = await res.json().catch(() => ({}));
    return { success: true, messageId: data.id || `resend-${Date.now()}` };
  } catch (err) {
    console.error("[email:resend] network error:", err);
    return { success: false, messageId: null, error: String(err) };
  }
}

export function appointmentReminderEmail(patientName: string, therapistName: string, dateTime: string) {
  return {
    subject: `Appointment Reminder - ${therapistName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #16a34a, #9333ea); padding: 30px; border-radius: 16px; text-align: center; color: white;">
          <h1 style="margin: 0;">Nishma Wellness</h1>
        </div>
        <div style="padding: 30px 0;">
          <h2>Hi ${patientName},</h2>
          <p>This is a reminder for your upcoming session:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Therapist:</strong> ${therapistName}</p>
            <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${dateTime}</p>
            <p style="margin: 5px 0;"><strong>Type:</strong> Video Session</p>
          </div>
          <p>Please ensure you have a stable internet connection and a quiet space for your session.</p>
          <a href="${process.env.NEXTAUTH_URL}/patient/appointments" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">View Appointment</a>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 12px;">
          <p>If you need to cancel, please do so at least 24 hours in advance.</p>
          <p>Nishma Wellness | <a href="${process.env.NEXTAUTH_URL}/privacy">Privacy Policy</a></p>
        </div>
      </div>
    `,
  };
}

export function welcomeEmail(name: string) {
  return {
    subject: "Welcome to Nishma Wellness!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #16a34a, #9333ea); padding: 30px; border-radius: 16px; text-align: center; color: white;">
          <h1 style="margin: 0;">Welcome to Nishma Wellness</h1>
        </div>
        <div style="padding: 30px 0;">
          <h2>Hello ${name}!</h2>
          <p>We're thrilled to have you join the Nishma Wellness community. Your journey to better well-being starts now.</p>
          <h3>Here's what you can do:</h3>
          <ul style="line-height: 2;">
            <li>Complete your wellness onboarding assessment</li>
            <li>Book a session with a licensed therapist</li>
            <li>Chat with our AI TwinClone wellness assistant</li>
            <li>Explore our wellness training programs</li>
            <li>Try guided breathing and meditation exercises</li>
          </ul>
          <a href="${process.env.NEXTAUTH_URL}/patient" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">Go to Dashboard</a>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 12px;">
          <p>If you need immediate help, call 988 (Suicide & Crisis Lifeline).</p>
          <p>Nishma Wellness | <a href="${process.env.NEXTAUTH_URL}/privacy">Privacy Policy</a></p>
        </div>
      </div>
    `,
  };
}

export function passwordResetEmail(name: string, resetToken: string) {
  return {
    subject: "Reset Your Password - Nishma Wellness",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #16a34a, #9333ea); padding: 30px; border-radius: 16px; text-align: center; color: white;">
          <h1 style="margin: 0;">Nishma Wellness</h1>
        </div>
        <div style="padding: 30px 0;">
          <h2>Hi ${name},</h2>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <a href="${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">Reset Password</a>
          <p style="color: #6b7280; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  };
}
