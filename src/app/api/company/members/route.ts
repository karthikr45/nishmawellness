import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: Add member to org (invite by email or bulk)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Bulk add (CSV style)
  if (Array.isArray(body.members)) {
    const results = [];
    for (const m of body.members) {
      const user = await prisma.user.findUnique({ where: { email: m.email } });
      if (user) {
        const member = await prisma.orgMember.upsert({
          where: { organizationId_userId: { organizationId: body.organizationId, userId: user.id } },
          create: {
            organizationId: body.organizationId,
            userId: user.id,
            role: m.role || "EMPLOYEE",
            locationId: m.locationId || null,
            departmentId: m.departmentId || null,
            employeeId: m.employeeId || null,
            designation: m.designation || null,
          },
          update: {
            role: m.role || "EMPLOYEE",
            locationId: m.locationId || null,
            departmentId: m.departmentId || null,
            employeeId: m.employeeId || null,
            designation: m.designation || null,
          },
        });
        results.push({ email: m.email, status: "added", member });
      } else {
        // Create invite for non-existing users
        await prisma.orgInvite.create({
          data: {
            organizationId: body.organizationId,
            email: m.email,
            role: m.role || "EMPLOYEE",
            locationId: m.locationId || null,
            departmentId: m.departmentId || null,
            invitedBy: session.user.id,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });
        results.push({ email: m.email, status: "invited" });
      }
    }
    return NextResponse.json({ results });
  }

  // Single add
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) {
    // Create invite
    const invite = await prisma.orgInvite.create({
      data: {
        organizationId: body.organizationId,
        email: body.email,
        role: body.role || "EMPLOYEE",
        locationId: body.locationId || null,
        departmentId: body.departmentId || null,
        invitedBy: session.user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    return NextResponse.json({ status: "invited", invite });
  }

  const member = await prisma.orgMember.upsert({
    where: { organizationId_userId: { organizationId: body.organizationId, userId: user.id } },
    create: {
      organizationId: body.organizationId,
      userId: user.id,
      role: body.role || "EMPLOYEE",
      locationId: body.locationId || null,
      departmentId: body.departmentId || null,
      employeeId: body.employeeId || null,
      designation: body.designation || null,
    },
    update: { role: body.role || "EMPLOYEE" },
  });

  return NextResponse.json({ status: "added", member });
}

// GET: List members
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const members = await prisma.orgMember.findMany({
    where: { organizationId: orgId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      location: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
    },
    orderBy: { joinedAt: "desc" },
  });

  return NextResponse.json(members);
}
