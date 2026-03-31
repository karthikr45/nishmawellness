import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("programId");

  if (!programId) {
    return NextResponse.json({ error: "programId required" }, { status: 400 });
  }

  const lessons = await prisma.lesson.findMany({
    where: { programId, isPublished: true },
    orderBy: { order: "asc" },
    include: {
      progress: session?.user
        ? { where: { userId: session.user.id } }
        : false,
    },
  });

  return NextResponse.json(lessons);
}
