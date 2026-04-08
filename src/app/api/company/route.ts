import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

// GET: Get company details (for admin/HR of the org, or platform admin)
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Platform admin sees all orgs
  if (session.user.role === "ADMIN") {
    const orgs = await prisma.organization.findMany({
      include: {
        locations: { include: { divisions: { include: { departments: true } } } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orgs);
  }

  // Org member sees their own org
  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
    include: {
      organization: {
        include: {
          locations: { include: { divisions: { include: { departments: true } } } },
          _count: { select: { members: true } },
        },
      },
    },
  });

  return NextResponse.json(membership?.organization || null);
}

// POST: Create a new company (self-service or admin)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const joinCode = uuid().substring(0, 8).toUpperCase();

  const org = await prisma.organization.create({
    data: {
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      domain: body.domain || null,
      domains: JSON.stringify(body.domains || []),
      industry: body.industry || null,
      size: body.size || null,
      country: body.country || "US",
      currency: body.currency || "USD",
      contactEmail: body.contactEmail || session.user.email,
      contactName: body.contactName || session.user.name,
      contactPhone: body.contactPhone || null,
      plan: body.plan || "STANDARD",
      maxEmployees: body.maxEmployees || 100,
      sessionsPerEmployee: body.sessionsPerEmployee || 12,
      joinCode,
      welcomeMessage: body.welcomeMessage || null,
    },
  });

  // Add creator as ORG_ADMIN
  await prisma.orgMember.create({
    data: {
      organizationId: org.id,
      userId: session.user.id,
      role: "ORG_ADMIN",
    },
  });

  return NextResponse.json({ ...org, joinCode });
}
