import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = category;

  const exercises = await prisma.guidedExercise.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { logs: true } } },
  });

  return NextResponse.json(exercises);
}
