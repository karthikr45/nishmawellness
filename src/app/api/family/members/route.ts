import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: Invite / add a family member by email
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, role, isMinor, canViewProgress } = await req.json();

  // Find the family group
  const family = await prisma.familyGroup.findUnique({
    where: { ownerId: session.user.id },
    include: { _count: { select: { members: true } } },
  });

  if (!family) {
    return NextResponse.json({ error: "No family group found" }, { status: 404 });
  }

  if (family._count.members >= family.maxMembers) {
    return NextResponse.json({ error: "Family group is full" }, { status: 409 });
  }

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found. They need to register first." }, { status: 404 });
  }

  // Add member
  const member = await prisma.familyMember.upsert({
    where: { familyGroupId_userId: { familyGroupId: family.id, userId: user.id } },
    create: {
      familyGroupId: family.id,
      userId: user.id,
      role: role || "MEMBER",
      isMinor: isMinor || false,
      canViewProgress: canViewProgress ?? false,
    },
    update: {
      role: role || "MEMBER",
      isMinor: isMinor || false,
      canViewProgress: canViewProgress ?? false,
    },
  });

  // Update user's family reference
  await prisma.user.update({
    where: { id: user.id },
    data: { familyId: family.id, familyRole: role || "MEMBER" },
  });

  return NextResponse.json(member);
}

// DELETE: Remove a family member
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await req.json();

  const family = await prisma.familyGroup.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!family) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await prisma.familyMember.deleteMany({
    where: { familyGroupId: family.id, userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { familyId: null, familyRole: null },
  });

  return NextResponse.json({ success: true });
}
