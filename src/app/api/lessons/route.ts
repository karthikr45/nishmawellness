import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("programId");

  if (!programId) {
    return NextResponse.json({ error: "programId required" }, { status: 400 });
  }

  const lessons = await prisma.lesson.findMany({
    where: { programId, isPublished: true },
    orderBy: { order: "asc" },
    include: { progress: true },
  });

  return NextResponse.json(lessons);
}
