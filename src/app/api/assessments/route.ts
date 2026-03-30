import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function calculateSeverity(type: string, score: number): string {
  if (type === "PHQ9") {
    if (score <= 4) return "MINIMAL";
    if (score <= 9) return "MILD";
    if (score <= 14) return "MODERATE";
    if (score <= 19) return "MODERATELY_SEVERE";
    return "SEVERE";
  }
  if (type === "GAD7") {
    if (score <= 4) return "MINIMAL";
    if (score <= 9) return "MILD";
    if (score <= 14) return "MODERATE";
    return "SEVERE";
  }
  return "UNKNOWN";
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assessments = await prisma.assessment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assessments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, responses } = await req.json();
  const score = (responses as number[]).reduce((sum: number, val: number) => sum + val, 0);
  const severity = calculateSeverity(type, score);

  const assessment = await prisma.assessment.create({
    data: {
      userId: session.user.id,
      type,
      responses: JSON.stringify(responses),
      score,
      severity,
    },
  });

  return NextResponse.json(assessment);
}
