import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: Add member to organization
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { organizationId, userId, role, department } = await req.json();

  const member = await prisma.orgMember.upsert({
    where: { organizationId_userId: { organizationId, userId } },
    create: {
      organizationId,
      userId,
      role: role || "EMPLOYEE",
      department: department || null,
    },
    update: {
      role: role || "EMPLOYEE",
      department: department || null,
    },
  });

  return NextResponse.json(member);
}
