import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: Employee self-joins using company join code or domain match
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { joinCode, locationId, departmentId } = await req.json();

  // Find org by join code
  const org = await prisma.organization.findUnique({ where: { joinCode } });
  if (!org || !org.isActive) {
    return NextResponse.json({ error: "Invalid or expired join code" }, { status: 404 });
  }

  // Check if already a member
  const existing = await prisma.orgMember.findUnique({
    where: { organizationId_userId: { organizationId: org.id, userId: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already a member" }, { status: 409 });
  }

  // Check max employees
  const memberCount = await prisma.orgMember.count({ where: { organizationId: org.id } });
  if (memberCount >= org.maxEmployees) {
    return NextResponse.json({ error: "Organization has reached maximum employees" }, { status: 409 });
  }

  // Check pending invite
  const invite = await prisma.orgInvite.findFirst({
    where: { organizationId: org.id, email: session.user.email!, status: "PENDING" },
  });

  const member = await prisma.orgMember.create({
    data: {
      organizationId: org.id,
      userId: session.user.id,
      role: invite?.role || "EMPLOYEE",
      locationId: invite?.locationId || locationId || null,
      departmentId: invite?.departmentId || departmentId || null,
    },
  });

  // Mark invite as accepted
  if (invite) {
    await prisma.orgInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    });
  }

  // Update user
  await prisma.user.update({
    where: { id: session.user.id },
    data: { organizationId: org.id, userType: "EMPLOYEE" },
  });

  return NextResponse.json({ success: true, organization: org.name, member });
}
