import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail, welcomeEmail } from "@/lib/email";
import { v4 as uuid } from "uuid";

// Self-service company registration: creates org + admin user in one step
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      // Admin account
      adminName, adminEmail, adminPassword, adminPhone,
      // Company details
      companyName, industry, size, country, currency, domain, maxEmployees,
    } = body;

    // Validate required fields
    if (!adminName || !adminEmail || !adminPassword || !companyName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered. Please login and create company from your dashboard." }, { status: 409 });
    }

    // Check if company slug exists
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const existingOrg = await prisma.organization.findUnique({ where: { slug } });
    if (existingOrg) {
      return NextResponse.json({ error: "A company with this name already exists" }, { status: 409 });
    }

    // Create admin user
    const hashedPassword = await hash(adminPassword, 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: "PATIENT", // Base role is PATIENT; org role is ORG_ADMIN
        phone: adminPhone || null,
        isActive: true,
        onboardingDone: true, // Skip personal onboarding for company admin
        userType: "EMPLOYEE",
      },
    });

    // Create organization
    const joinCode = uuid().substring(0, 8).toUpperCase();
    const org = await prisma.organization.create({
      data: {
        name: companyName,
        slug,
        domain: domain || null,
        domains: domain ? JSON.stringify([domain]) : "[]",
        industry: industry || null,
        size: size || null,
        country: country || "IN",
        currency: currency || (country === "IN" ? "INR" : "USD"),
        contactEmail: adminEmail,
        contactName: adminName,
        contactPhone: adminPhone || null,
        plan: "STANDARD",
        maxEmployees: maxEmployees ? parseInt(maxEmployees) : 100,
        joinCode,
      },
    });

    // Add admin as ORG_ADMIN member
    await prisma.orgMember.create({
      data: {
        organizationId: org.id,
        userId: adminUser.id,
        role: "ORG_ADMIN",
      },
    });

    // Update user with org reference
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { organizationId: org.id },
    });

    // Send welcome email
    const welcome = welcomeEmail(adminName);
    sendEmail({ to: adminEmail, ...welcome }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Company registered successfully!",
      company: { name: org.name, joinCode },
      user: { id: adminUser.id, email: adminUser.email, name: adminUser.name },
    });
  } catch (error) {
    console.error("Company registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
