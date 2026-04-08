import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List organizations (admin) or get user's org membership
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Always check org membership first (for role-based routing)
  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });

  // If user has org membership, return it with role
  if (membership) {
    return NextResponse.json(membership);
  }

  // Platform admin with no org membership: return org list
  if (session.user.role === "ADMIN") {
    const orgs = await prisma.organization.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orgs);
  }

  return NextResponse.json(null);
}

// POST: Create a new organization (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, slug, domain, contactEmail, contactName, plan, maxEmployees, sessionsPerEmployee, industry, size } = body;

  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Organization slug already exists" }, { status: 409 });
  }

  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      domain: domain || null,
      contactEmail,
      contactName,
      plan: plan || "STANDARD",
      maxEmployees: maxEmployees || 100,
      sessionsPerEmployee: sessionsPerEmployee || 12,
      industry: industry || null,
      size: size || null,
    },
  });

  return NextResponse.json(org);
}

// PATCH: Update organization
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...data } = body;

  const org = await prisma.organization.update({
    where: { id },
    data,
  });

  return NextResponse.json(org);
}
