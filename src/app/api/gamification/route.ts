import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Calculate streaks, XP, badges
  const [journalEntries, exerciseLogs, assessments, aiChats, appointments, progress] = await Promise.all([
    prisma.journalEntry.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 60 }),
    prisma.exerciseLog.count({ where: { userId, completed: true } }),
    prisma.assessment.count({ where: { userId } }),
    prisma.aIChat.count({ where: { userId, role: "user" } }),
    prisma.appointment.count({ where: { patientId: userId, status: "COMPLETED" } }),
    prisma.progress.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 60 }),
  ]);

  // Calculate journal streak
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const hasEntry = journalEntries.some(
      (e) => new Date(e.date).toDateString() === checkDate.toDateString()
    );
    if (hasEntry) streak++;
    else if (i > 0) break;
  }

  // Calculate mood logging streak
  let moodStreak = 0;
  for (let i = 0; i < 60; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const hasMood = progress.some(
      (p) => p.type === "MOOD" && new Date(p.date).toDateString() === checkDate.toDateString()
    );
    if (hasMood) moodStreak++;
    else if (i > 0) break;
  }

  // XP calculation
  const xp =
    journalEntries.length * 10 +
    exerciseLogs * 25 +
    assessments * 50 +
    aiChats * 5 +
    appointments * 100 +
    streak * 15;

  // Level (every 200 XP = 1 level)
  const level = Math.floor(xp / 200) + 1;
  const xpForNextLevel = level * 200;
  const xpProgress = ((xp % 200) / 200) * 100;

  // Badges
  const badges: { id: string; name: string; desc: string; icon: string; earned: boolean }[] = [];
  if (journalEntries.length >= 1) badges.push({ id: "first_journal", name: "First Entry", desc: "Wrote your first journal entry", icon: "pencil", earned: true });
  if (streak >= 3) badges.push({ id: "streak_3", name: "3-Day Streak", desc: "Journaled 3 days in a row", icon: "fire", earned: true });
  if (streak >= 7) badges.push({ id: "streak_7", name: "Week Warrior", desc: "7-day journal streak", icon: "star", earned: true });
  if (streak >= 30) badges.push({ id: "streak_30", name: "Monthly Master", desc: "30-day journal streak", icon: "trophy", earned: true });
  if (exerciseLogs >= 1) badges.push({ id: "first_exercise", name: "First Breath", desc: "Completed your first exercise", icon: "wind", earned: true });
  if (exerciseLogs >= 10) badges.push({ id: "exercise_10", name: "Zen Seeker", desc: "Completed 10 exercises", icon: "brain", earned: true });
  if (exerciseLogs >= 50) badges.push({ id: "exercise_50", name: "Mindfulness Guru", desc: "Completed 50 exercises", icon: "sparkles", earned: true });
  if (appointments >= 1) badges.push({ id: "first_session", name: "First Step", desc: "Attended first therapy session", icon: "heart", earned: true });
  if (appointments >= 10) badges.push({ id: "session_10", name: "Committed", desc: "Completed 10 therapy sessions", icon: "award", earned: true });
  if (assessments >= 1) badges.push({ id: "self_aware", name: "Self-Aware", desc: "Completed a wellness assessment", icon: "clipboard", earned: true });
  if (aiChats >= 10) badges.push({ id: "ai_friend", name: "AI Friend", desc: "Had 10 AI chat conversations", icon: "bot", earned: true });
  if (level >= 5) badges.push({ id: "level_5", name: "Rising Star", desc: "Reached level 5", icon: "star", earned: true });
  if (level >= 10) badges.push({ id: "level_10", name: "Wellness Champion", desc: "Reached level 10", icon: "crown", earned: true });

  // Add locked badges for those not yet earned
  const allBadges = [
    { id: "first_journal", name: "First Entry", desc: "Write your first journal entry", icon: "pencil" },
    { id: "streak_3", name: "3-Day Streak", desc: "Journal 3 days in a row", icon: "fire" },
    { id: "streak_7", name: "Week Warrior", desc: "7-day journal streak", icon: "star" },
    { id: "streak_30", name: "Monthly Master", desc: "30-day journal streak", icon: "trophy" },
    { id: "first_exercise", name: "First Breath", desc: "Complete your first exercise", icon: "wind" },
    { id: "exercise_10", name: "Zen Seeker", desc: "Complete 10 exercises", icon: "brain" },
    { id: "first_session", name: "First Step", desc: "Attend first therapy session", icon: "heart" },
    { id: "session_10", name: "Committed", desc: "Complete 10 therapy sessions", icon: "award" },
    { id: "self_aware", name: "Self-Aware", desc: "Complete a wellness assessment", icon: "clipboard" },
    { id: "ai_friend", name: "AI Friend", desc: "Have 10 AI conversations", icon: "bot" },
    { id: "level_5", name: "Rising Star", desc: "Reach level 5", icon: "star" },
    { id: "level_10", name: "Wellness Champion", desc: "Reach level 10", icon: "crown" },
  ].map((b) => ({ ...b, earned: badges.some((eb) => eb.id === b.id) }));

  return NextResponse.json({
    xp,
    level,
    xpForNextLevel,
    xpProgress,
    streaks: { journal: streak, mood: moodStreak },
    stats: { journals: journalEntries.length, exercises: exerciseLogs, sessions: appointments, assessments, aiChats },
    badges: allBadges,
  });
}
