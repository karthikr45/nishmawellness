import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const level = searchParams.get("level");

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = category;
  if (level) where.level = level;

  const programs = await prisma.program.findMany({
    where,
    include: {
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(programs);
}
