import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();

  // This week: Mon-Sun
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay() + 1);
  thisWeekStart.setHours(0, 0, 0, 0);

  // Last week
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);

  // Fetch data for both weeks
  const [
    thisWeekProgress,
    lastWeekProgress,
    thisWeekJournals,
    lastWeekJournals,
    thisWeekExercises,
    lastWeekExercises,
    thisWeekChats,
    lastWeekChats,
    thisWeekAppointments,
    lastWeekAppointments,
    allAssessments,
    enrollments,
    memories,
  ] = await Promise.all([
    prisma.progress.findMany({ where: { userId, date: { gte: thisWeekStart } } }),
    prisma.progress.findMany({ where: { userId, date: { gte: lastWeekStart, lt: lastWeekEnd } } }),
    prisma.journalEntry.findMany({ where: { userId, date: { gte: thisWeekStart } } }),
    prisma.journalEntry.findMany({ where: { userId, date: { gte: lastWeekStart, lt: lastWeekEnd } } }),
    prisma.exerciseLog.count({ where: { userId, completed: true, createdAt: { gte: thisWeekStart } } }),
    prisma.exerciseLog.count({ where: { userId, completed: true, createdAt: { gte: lastWeekStart, lt: lastWeekEnd } } }),
    prisma.aIChat.count({ where: { userId, role: "user", createdAt: { gte: thisWeekStart } } }),
    prisma.aIChat.count({ where: { userId, role: "user", createdAt: { gte: lastWeekStart, lt: lastWeekEnd } } }),
    prisma.appointment.count({ where: { patientId: userId, status: "COMPLETED", dateTime: { gte: thisWeekStart } } }),
    prisma.appointment.count({ where: { patientId: userId, status: "COMPLETED", dateTime: { gte: lastWeekStart, lt: lastWeekEnd } } }),
    prisma.assessment.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.enrollment.findMany({ where: { userId, status: "ACTIVE" }, include: { program: { select: { title: true } } } }),
    prisma.aIMemory.findMany({ where: { userId }, orderBy: { weight: "desc" }, take: 5 }),
  ]);

  // Calculate averages
  const avg = (arr: { value: number }[]) =>
    arr.length > 0 ? Math.round(arr.reduce((s, r) => s + r.value, 0) / arr.length) : null;

  const thisWeekMood = avg(thisWeekProgress.filter((p) => p.type === "MOOD"));
  const lastWeekMood = avg(lastWeekProgress.filter((p) => p.type === "MOOD"));
  const thisWeekSleep = avg(thisWeekProgress.filter((p) => p.type === "SLEEP"));
  const lastWeekSleep = avg(lastWeekProgress.filter((p) => p.type === "SLEEP"));

  const thisWeekJournalMood = thisWeekJournals.length > 0
    ? Math.round(thisWeekJournals.reduce((s, j) => s + j.mood, 0) / thisWeekJournals.length * 10)
    : null;

  const thisWeekAnxiety = thisWeekJournals.length > 0
    ? Math.round(thisWeekJournals.reduce((s, j) => s + j.anxiety, 0) / thisWeekJournals.length * 10)
    : null;

  const thisWeekEnergy = thisWeekJournals.length > 0
    ? Math.round(thisWeekJournals.reduce((s, j) => s + j.energy, 0) / thisWeekJournals.length * 10)
    : null;

  // Compare function
  const compare = (current: number | null, previous: number | null) => {
    if (current === null || previous === null) return { change: 0, direction: "same" as const };
    const diff = current - previous;
    return {
      change: Math.abs(diff),
      direction: diff > 0 ? "up" as const : diff < 0 ? "down" as const : "same" as const,
    };
  };

  // Daily mood breakdown for the week
  const dailyMood: { day: string; mood: number | null; sleep: number | null; energy: number | null }[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(thisWeekStart);
    date.setDate(date.getDate() + i);
    const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });

    const dayProgress = thisWeekProgress.filter(
      (p) => new Date(p.date).toDateString() === date.toDateString()
    );
    const dayJournal = thisWeekJournals.find(
      (j) => new Date(j.date).toDateString() === date.toDateString()
    );

    dailyMood.push({
      day: dayStr,
      mood: dayProgress.find((p) => p.type === "MOOD")?.value ?? (dayJournal ? dayJournal.mood * 10 : null),
      sleep: dayProgress.find((p) => p.type === "SLEEP")?.value ?? (dayJournal ? dayJournal.sleep * 10 : null),
      energy: dayJournal ? dayJournal.energy * 10 : null,
    });
  }

  // Overall wellness score (composite)
  const wellnessFactors = [thisWeekMood, thisWeekSleep, thisWeekEnergy, thisWeekAnxiety ? 100 - thisWeekAnxiety : null].filter(Boolean) as number[];
  const overallWellness = wellnessFactors.length > 0
    ? Math.round(wellnessFactors.reduce((s, v) => s + v, 0) / wellnessFactors.length)
    : null;

  const lastWeekFactors = [lastWeekMood, lastWeekSleep].filter(Boolean) as number[];
  const lastWeekWellness = lastWeekFactors.length > 0
    ? Math.round(lastWeekFactors.reduce((s, v) => s + v, 0) / lastWeekFactors.length)
    : null;

  // Generate highlights
  const highlights: string[] = [];
  if (thisWeekMood && lastWeekMood && thisWeekMood > lastWeekMood) {
    highlights.push(`Your mood improved by ${thisWeekMood - lastWeekMood}% compared to last week`);
  }
  if (thisWeekJournals.length >= 5) {
    highlights.push(`You journaled ${thisWeekJournals.length} times this week — great consistency!`);
  }
  if (thisWeekExercises >= 3) {
    highlights.push(`You completed ${thisWeekExercises} exercises this week`);
  }
  if (thisWeekAppointments > 0) {
    highlights.push(`You attended ${thisWeekAppointments} therapy session${thisWeekAppointments > 1 ? "s" : ""} this week`);
  }
  if (thisWeekChats >= 5) {
    highlights.push(`You had ${thisWeekChats} AI wellness conversations`);
  }
  if (highlights.length === 0) {
    highlights.push("Start tracking your mood and journaling to see insights here");
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (!thisWeekMood || thisWeekJournals.length < 3) {
    recommendations.push("Try logging your mood daily for more accurate insights");
  }
  if (thisWeekExercises < 3) {
    recommendations.push("Try to complete at least 3 guided exercises this week");
  }
  if (thisWeekAnxiety && thisWeekAnxiety > 60) {
    recommendations.push("Your anxiety levels are elevated — consider trying a breathing exercise or booking a session");
  }
  if (thisWeekSleep && thisWeekSleep < 50) {
    recommendations.push("Your sleep quality is low — check out Sleep & Sounds for relaxation tools");
  }
  if (enrollments.length === 0) {
    recommendations.push("Enroll in a wellness program to structure your wellness journey");
  }

  return NextResponse.json({
    period: {
      start: thisWeekStart.toISOString(),
      end: now.toISOString(),
      label: `${thisWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    },
    overallWellness: {
      score: overallWellness,
      comparison: compare(overallWellness, lastWeekWellness),
    },
    metrics: {
      mood: { current: thisWeekMood, comparison: compare(thisWeekMood, lastWeekMood) },
      sleep: { current: thisWeekSleep, comparison: compare(thisWeekSleep, lastWeekSleep) },
      anxiety: { current: thisWeekAnxiety, comparison: thisWeekAnxiety ? { change: thisWeekAnxiety, direction: thisWeekAnxiety > 50 ? "up" as const : "down" as const } : { change: 0, direction: "same" as const } },
      energy: { current: thisWeekEnergy },
    },
    activity: {
      journalEntries: { current: thisWeekJournals.length, previous: lastWeekJournals.length },
      exercises: { current: thisWeekExercises, previous: lastWeekExercises },
      aiChats: { current: thisWeekChats, previous: lastWeekChats },
      sessions: { current: thisWeekAppointments, previous: lastWeekAppointments },
    },
    dailyMood,
    highlights,
    recommendations,
    recentAssessments: allAssessments.map((a) => ({ type: a.type, score: a.score, severity: a.severity, date: a.createdAt })),
    activePrograms: enrollments.map((e) => ({ title: e.program.title, progress: e.progress })),
    topThemes: memories.map((m) => m.content),
  });
}
