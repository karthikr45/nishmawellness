import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get pulse surveys for org/campus
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  const campusId = searchParams.get("campusId");

  const where: Record<string, unknown> = { isActive: true };
  if (orgId) where.organizationId = orgId;
  if (campusId) where.campusId = campusId;

  const surveys = await prisma.pulseSurvey.findMany({
    where,
    include: { _count: { select: { responses: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(surveys.map((s) => ({
    ...s,
    questions: JSON.parse(s.questions),
    responseCount: s._count.responses,
  })));
}

// POST: Create a pulse survey
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, questions, organizationId, campusId, frequency } = await req.json();

  const survey = await prisma.pulseSurvey.create({
    data: {
      title,
      questions: JSON.stringify(questions),
      organizationId: organizationId || null,
      campusId: campusId || null,
      frequency: frequency || "WEEKLY",
    },
  });

  return NextResponse.json(survey);
}

// PATCH: Submit a response to a pulse survey
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { surveyId, answers } = await req.json();

  const response = await prisma.pulseSurveyResponse.create({
    data: {
      surveyId,
      userId: session.user.id,
      answers: JSON.stringify(answers),
      anonymous: true,
    },
  });

  return NextResponse.json(response);
}
