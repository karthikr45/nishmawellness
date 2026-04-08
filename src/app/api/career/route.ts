import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Career Interest Assessment & Career AI guidance
const CAREER_CLUSTERS = [
  { id: "tech", name: "Technology & Engineering", careers: ["Software Engineer", "Data Scientist", "AI/ML Engineer", "Cybersecurity", "Cloud Architect", "Product Manager"], traits: ["analytical", "problem-solving", "logical", "curious"] },
  { id: "health", name: "Healthcare & Medicine", careers: ["Doctor", "Nurse", "Psychologist", "Pharmacist", "Biomedical Engineer", "Public Health"], traits: ["empathetic", "patient", "detail-oriented", "service-minded"] },
  { id: "business", name: "Business & Finance", careers: ["Investment Banker", "Consultant", "Entrepreneur", "Accountant", "Marketing Manager", "HR Manager"], traits: ["leadership", "strategic", "communicative", "competitive"] },
  { id: "creative", name: "Creative & Design", careers: ["UX Designer", "Graphic Designer", "Content Creator", "Filmmaker", "Architect", "Fashion Designer"], traits: ["creative", "visual", "innovative", "expressive"] },
  { id: "science", name: "Science & Research", careers: ["Research Scientist", "Environmental Scientist", "Physicist", "Biologist", "Chemist", "Astronomer"], traits: ["curious", "methodical", "patient", "analytical"] },
  { id: "social", name: "Social Impact & Education", careers: ["Teacher", "Social Worker", "Counselor", "Non-profit Leader", "Journalist", "Lawyer"], traits: ["empathetic", "communicative", "passionate", "service-minded"] },
  { id: "arts", name: "Arts & Entertainment", careers: ["Musician", "Actor", "Writer", "Game Designer", "Animator", "Photographer"], traits: ["creative", "expressive", "passionate", "resilient"] },
  { id: "trade", name: "Skilled Trades & Services", careers: ["Chef", "Electrician", "Pilot", "Athlete", "Event Manager", "Real Estate Agent"], traits: ["hands-on", "practical", "energetic", "independent"] },
];

const ASSESSMENT_QUESTIONS = [
  { q: "I enjoy solving complex puzzles and logical problems", clusters: ["tech", "science"] },
  { q: "I like helping people and making them feel better", clusters: ["health", "social"] },
  { q: "I enjoy leading teams and making decisions", clusters: ["business"] },
  { q: "I love creating art, music, or visual designs", clusters: ["creative", "arts"] },
  { q: "I'm curious about how things work in nature", clusters: ["science"] },
  { q: "I enjoy writing, storytelling, or public speaking", clusters: ["social", "arts", "creative"] },
  { q: "I like working with numbers and financial data", clusters: ["business", "tech"] },
  { q: "I care deeply about social justice and equality", clusters: ["social"] },
  { q: "I prefer hands-on work over desk work", clusters: ["trade", "health"] },
  { q: "I enjoy experimenting and testing new ideas", clusters: ["tech", "science", "creative"] },
  { q: "I'm comfortable with uncertainty and risk", clusters: ["business", "arts", "trade"] },
  { q: "I like learning about the human mind and behavior", clusters: ["health", "social"] },
  { q: "I enjoy building or coding things from scratch", clusters: ["tech", "creative"] },
  { q: "I'm passionate about health and wellness", clusters: ["health"] },
  { q: "I love traveling and experiencing new cultures", clusters: ["trade", "arts", "social"] },
];

export async function GET() {
  return NextResponse.json({ questions: ASSESSMENT_QUESTIONS, clusters: CAREER_CLUSTERS });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { answers } = await req.json(); // Array of 1-5 scores for each question

  // Calculate cluster scores
  const clusterScores: Record<string, number> = {};
  CAREER_CLUSTERS.forEach((c) => { clusterScores[c.id] = 0; });

  ASSESSMENT_QUESTIONS.forEach((q, i) => {
    const score = answers[i] || 3;
    q.clusters.forEach((clusterId) => {
      clusterScores[clusterId] += score;
    });
  });

  // Rank clusters
  const ranked = Object.entries(clusterScores)
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => {
      const cluster = CAREER_CLUSTERS.find((c) => c.id === id)!;
      const maxPossible = ASSESSMENT_QUESTIONS.filter((q) => q.clusters.includes(id)).length * 5;
      return {
        ...cluster,
        score,
        percentage: Math.round((score / maxPossible) * 100),
      };
    });

  // Save as assessment
  await prisma.assessment.create({
    data: {
      userId: session.user.id,
      type: "CAREER",
      responses: JSON.stringify(answers),
      score: ranked[0].percentage,
      severity: "CAREER_MATCH",
    },
  });

  // Store top interests as AI memories
  for (const top of ranked.slice(0, 3)) {
    await prisma.aIMemory.upsert({
      where: { id: `career-${session.user.id}-${top.id}` },
      create: {
        id: `career-${session.user.id}-${top.id}`,
        userId: session.user.id,
        category: "PREFERENCE",
        content: `Career interest: ${top.name}`,
        context: `Top careers: ${top.careers.slice(0, 3).join(", ")}`,
        source: "SELF_REPORTED",
      },
      update: {
        content: `Career interest: ${top.name}`,
        weight: top.percentage / 20,
      },
    });
  }

  return NextResponse.json({
    topMatches: ranked.slice(0, 3),
    allResults: ranked,
    summary: `Your strongest interest areas are ${ranked[0].name} (${ranked[0].percentage}%), ${ranked[1].name} (${ranked[1].percentage}%), and ${ranked[2].name} (${ranked[2].percentage}%).`,
  });
}
