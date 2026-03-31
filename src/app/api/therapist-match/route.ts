import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's onboarding data
  const onboarding = await prisma.onboardingResponse.findUnique({
    where: { userId: session.user.id },
  });

  // Get all active therapists
  const therapists = await prisma.user.findMany({
    where: { role: "THERAPIST", isActive: true },
    select: {
      id: true, name: true, bio: true, specialization: true,
      experience: true, hourlyRate: true, avatar: true,
      therapistReviews: { select: { rating: true } },
      availability: true,
    },
  });

  if (!onboarding) {
    // No onboarding data — return all therapists with default scoring
    return NextResponse.json(
      therapists.map((t) => ({
        ...t,
        matchScore: 70 + Math.floor(Math.random() * 20),
        matchReasons: ["Available for new patients"],
        rating: t.therapistReviews.length > 0
          ? t.therapistReviews.reduce((s, r) => s + r.rating, 0) / t.therapistReviews.length
          : 4.5,
      }))
    );
  }

  const goals = JSON.parse(onboarding.primaryGoals) as string[];
  const concerns = JSON.parse(onboarding.concerns) as string[];
  const preferredStyle = onboarding.preferredStyle;

  // Score each therapist
  const scored = therapists.map((therapist) => {
    let score = 50;
    const reasons: string[] = [];
    const spec = (therapist.specialization || "").toLowerCase();

    // Match specialization to goals
    const specMappings: Record<string, string[]> = {
      anxiety: ["anxiety", "cbt", "cognitive", "panic"],
      depression: ["depression", "mood", "cbt", "cognitive"],
      stress: ["stress", "mindfulness", "burnout", "workplace"],
      sleep: ["sleep", "insomnia", "relaxation"],
      relationships: ["relationship", "family", "couples", "marriage"],
      trauma: ["trauma", "ptsd", "emdr"],
      "self-esteem": ["self-esteem", "confidence", "identity"],
      grief: ["grief", "loss", "bereavement"],
      mindfulness: ["mindfulness", "meditation", "holistic"],
      family: ["family", "couples", "relationship"],
    };

    for (const goal of goals) {
      const keywords = specMappings[goal] || [goal];
      if (keywords.some((k) => spec.includes(k))) {
        score += 15;
        reasons.push(`Specializes in ${goal}`);
      }
    }

    // Match therapeutic approach
    if (preferredStyle) {
      const styleMap: Record<string, string[]> = {
        CBT: ["cbt", "cognitive", "behavioral"],
        MINDFULNESS: ["mindfulness", "meditation", "holistic", "yoga"],
        HOLISTIC: ["holistic", "integrative", "yoga", "nutrition"],
        TALK_THERAPY: ["psychotherapy", "talk", "psychodynamic"],
      };
      const styleKeywords = styleMap[preferredStyle] || [];
      if (styleKeywords.some((k) => spec.includes(k))) {
        score += 10;
        reasons.push(`Matches your preferred therapy style`);
      }
    }

    // Experience bonus
    if (therapist.experience && therapist.experience >= 10) {
      score += 5;
      reasons.push(`${therapist.experience}+ years experience`);
    }

    // Rating bonus
    const rating = therapist.therapistReviews.length > 0
      ? therapist.therapistReviews.reduce((s, r) => s + r.rating, 0) / therapist.therapistReviews.length
      : 4.5;
    if (rating >= 4.5) {
      score += 5;
      reasons.push("Highly rated by patients");
    }

    // Availability bonus
    if (therapist.availability.length > 0) {
      score += 5;
      reasons.push("Currently accepting patients");
    }

    if (reasons.length === 0) {
      reasons.push("Available for new patients");
    }

    return {
      ...therapist,
      matchScore: Math.min(99, score),
      matchReasons: reasons,
      rating,
      therapistReviews: undefined,
    };
  });

  // Sort by match score
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return NextResponse.json(scored);
}
