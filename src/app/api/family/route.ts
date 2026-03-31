import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get user's family group
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user owns a family
  const ownedFamily = await prisma.familyGroup.findUnique({
    where: { ownerId: session.user.id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      },
    },
  });

  if (ownedFamily) return NextResponse.json(ownedFamily);

  // Check if user is a member
  const membership = await prisma.familyMember.findFirst({
    where: { userId: session.user.id },
    include: {
      familyGroup: {
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, avatar: true } },
            },
          },
          owner: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (membership) return NextResponse.json(membership.familyGroup);

  return NextResponse.json(null);
}

// POST: Create family group
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, plan } = await req.json();

  // Check if user already owns a family
  const existing = await prisma.familyGroup.findUnique({
    where: { ownerId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have a family group" }, { status: 409 });
  }

  const family = await prisma.familyGroup.create({
    data: {
      name,
      ownerId: session.user.id,
      plan: plan || "FAMILY_BASIC",
    },
  });

  // Add owner as primary member
  await prisma.familyMember.create({
    data: {
      familyGroupId: family.id,
      userId: session.user.id,
      role: "PRIMARY",
    },
  });

  // Update user
  await prisma.user.update({
    where: { id: session.user.id },
    data: { familyId: family.id, familyRole: "PRIMARY" },
  });

  return NextResponse.json(family);
}

// PATCH: Update family group
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { sharedGoals, name } = body;

  const family = await prisma.familyGroup.update({
    where: { ownerId: session.user.id },
    data: {
      ...(name && { name }),
      ...(sharedGoals && { sharedGoals: JSON.stringify(sharedGoals) }),
    },
  });

  return NextResponse.json(family);
}
