import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Check if user has given AI consent
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const consent = await prisma.aIConsent.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ hasConsent: !!consent?.consentGiven, consent });
}

// POST: Record AI consent
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { consentType } = await req.json();

  const consent = await prisma.aIConsent.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      consentGiven: true,
      consentType: consentType || "ADULT",
      version: "1.0",
    },
    update: {
      consentGiven: true,
      consentType: consentType || "ADULT",
      givenAt: new Date(),
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CONSENT_GIVEN",
      category: "CONSENT",
      metadata: JSON.stringify({ consentType, version: "1.0" }),
    },
  });

  return NextResponse.json(consent);
}
