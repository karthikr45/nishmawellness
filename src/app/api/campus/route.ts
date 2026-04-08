import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List campuses (admin) or get user's campus
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "ADMIN") {
    const campuses = await prisma.campus.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(campuses);
  }

  const membership = await prisma.campusMember.findFirst({
    where: { userId: session.user.id },
    include: { campus: true },
  });

  return NextResponse.json(membership);
}

// POST: Create campus (admin)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, slug, type, domain, contactEmail, contactName, plan } = await req.json();

  const campus = await prisma.campus.create({
    data: {
      name,
      slug,
      type: type || "UNIVERSITY",
      domain: domain || null,
      contactEmail,
      contactName,
      plan: plan || "CAMPUS_BASIC",
    },
  });

  return NextResponse.json(campus);
}
