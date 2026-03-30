import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await prisma.journalEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 30,
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const entry = await prisma.journalEntry.create({
    data: {
      userId: session.user.id,
      mood: body.mood,
      energy: body.energy,
      anxiety: body.anxiety,
      sleep: body.sleep,
      gratitude: body.gratitude || "",
      highlight: body.highlight || "",
      challenge: body.challenge || "",
      freeWrite: body.freeWrite || "",
      tags: JSON.stringify(body.tags || []),
    },
  });

  // Also log progress records
  await prisma.progress.createMany({
    data: [
      { userId: session.user.id, type: "MOOD", value: body.mood * 10 },
      { userId: session.user.id, type: "SLEEP", value: body.sleep * 10 },
    ],
  });

  return NextResponse.json(entry);
}
