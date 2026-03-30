import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specialization = searchParams.get("specialization");

  const where: Record<string, unknown> = {
    role: "THERAPIST",
    isActive: true,
  };

  if (specialization) {
    where.specialization = { contains: specialization };
  }

  const therapists = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      specialization: true,
      experience: true,
      hourlyRate: true,
      avatar: true,
      availability: true,
      therapistReviews: {
        select: { rating: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const result = therapists.map((t) => ({
    ...t,
    rating: t.therapistReviews.length > 0
      ? t.therapistReviews.reduce((sum, r) => sum + r.rating, 0) / t.therapistReviews.length
      : 4.5 + Math.random() * 0.5, // Default rating
    reviewCount: t.therapistReviews.length,
    therapistReviews: undefined,
  }));

  return NextResponse.json(result);
}
