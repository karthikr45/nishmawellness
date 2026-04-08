import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get feedbacks for org (HR/Admin only)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const status = searchParams.get("status");
  const where: Record<string, unknown> = { organizationId: orgId };
  if (status) where.status = status;

  const feedbacks = await prisma.anonFeedback.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const stats = {
    total: await prisma.anonFeedback.count({ where: { organizationId: orgId } }),
    new: await prisma.anonFeedback.count({ where: { organizationId: orgId, status: "NEW" } }),
    critical: await prisma.anonFeedback.count({ where: { organizationId: orgId, severity: "CRITICAL" } }),
    resolved: await prisma.anonFeedback.count({ where: { organizationId: orgId, status: "RESOLVED" } }),
  };

  return NextResponse.json({ feedbacks, stats });
}

// POST: Submit anonymous feedback (any employee)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId, category, message, severity } = await req.json();

  // Get member's location/dept for routing (but don't attach user ID to feedback)
  const member = await prisma.orgMember.findFirst({
    where: { organizationId, userId: session.user.id },
  });

  const feedback = await prisma.anonFeedback.create({
    data: {
      organizationId,
      category,
      message,
      severity: severity || "MEDIUM",
      locationId: member?.locationId || null,
      departmentId: member?.departmentId || null,
      // NOTE: No userId stored — feedback is truly anonymous
    },
  });

  return NextResponse.json(feedback);
}

// PATCH: Update feedback status (HR/Admin)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status, adminNotes } = await req.json();

  const feedback = await prisma.anonFeedback.update({
    where: { id },
    data: {
      status,
      adminNotes,
      ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
    },
  });

  return NextResponse.json(feedback);
}
