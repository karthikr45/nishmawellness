import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get audit logs (admin only)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const severity = searchParams.get("severity");
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (severity) where.severity = severity;
  if (category) where.category = category;

  const logs = await prisma.auditLog.findMany({
    where,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const stats = {
    total: await prisma.auditLog.count(),
    critical: await prisma.auditLog.count({ where: { severity: "CRITICAL" } }),
    high: await prisma.auditLog.count({ where: { severity: "HIGH" } }),
    medium: await prisma.auditLog.count({ where: { severity: "MEDIUM" } }),
    today: await prisma.auditLog.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
  };

  return NextResponse.json({ logs, stats });
}
