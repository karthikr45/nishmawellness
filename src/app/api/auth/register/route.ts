import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail, welcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role, phone, specialization, licenseNumber, experience, bio } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);
    const userRole = role === "THERAPIST" ? "THERAPIST" : "PATIENT";

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
        phone: phone || null,
        specialization: userRole === "THERAPIST" ? specialization : null,
        licenseNumber: userRole === "THERAPIST" ? licenseNumber : null,
        experience: userRole === "THERAPIST" && experience ? parseInt(experience) : null,
        bio: bio || null,
        isActive: userRole === "PATIENT", // Therapists need admin approval
      },
    });

    // Create default availability for therapists
    if (userRole === "THERAPIST") {
      for (let day = 1; day <= 5; day++) {
        await prisma.availability.create({
          data: {
            therapistId: user.id,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "17:00",
            isAvailable: true,
          },
        });
      }
    }

    // Send welcome email
    const welcome = welcomeEmail(user.name);
    sendEmail({ to: user.email, ...welcome }).catch(console.error);

    return NextResponse.json({
      message: userRole === "THERAPIST"
        ? "Registration successful. Your account is pending admin approval."
        : "Registration successful.",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
