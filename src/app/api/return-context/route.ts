import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Return context for the returning user's personalized dashboard
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Update last login
  const user = await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
    select: { name: true, lastLoginAt: true, createdAt: true, role: true },
  });

  // Log activity
  await prisma.userActivity.create({
    data: { userId, type: "LOGIN", metadata: JSON.stringify({ timestamp: new Date() }) },
  });

  // Get last activity to determine "time away"
  const lastActivity = await prisma.userActivity.findFirst({
    where: { userId, type: "LOGIN", createdAt: { lt: new Date(Date.now() - 60000) } },
    orderBy: { createdAt: "desc" },
  });

  const daysSinceLastVisit = lastActivity
    ? Math.floor((Date.now() - new Date(lastActivity.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Gather personalized context
  const [
    recentProgress,
    upcomingAppointments,
    enrollments,
    unreadMessages,
    unreadNotifications,
    aiMemories,
    recentAIChats,
  ] = await Promise.all([
    prisma.progress.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 14,
    }),
    prisma.appointment.findMany({
      where: { patientId: userId, status: { in: ["SCHEDULED", "CONFIRMED"] }, dateTime: { gte: new Date() } },
      include: { therapist: { select: { name: true, specialization: true } } },
      orderBy: { dateTime: "asc" },
      take: 3,
    }),
    prisma.enrollment.findMany({
      where: { userId, status: "ACTIVE" },
      include: { program: { select: { title: true, category: true } } },
    }),
    prisma.message.count({ where: { receiverId: userId, isRead: false } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.aIMemory.findMany({
      where: { userId },
      orderBy: { weight: "desc" },
      take: 5,
    }),
    prisma.aIChat.findMany({
      where: { userId, role: "user" },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  // Calculate mood trend
  const moodRecords = recentProgress.filter((p) => p.type === "MOOD");
  const recentMood = moodRecords.length > 0 ? Math.round(moodRecords[0].value) : null;
  const weekAgoMood = moodRecords.length >= 7 ? Math.round(moodRecords[6].value) : null;
  const moodTrend = recentMood && weekAgoMood ? (recentMood > weekAgoMood ? "improving" : recentMood < weekAgoMood ? "declining" : "stable") : "unknown";

  // Generate personalized greeting
  let greeting = `Welcome back, ${user.name?.split(" ")[0]}!`;
  let subGreeting = "";

  if (daysSinceLastVisit === 0) {
    greeting = `Good to see you again, ${user.name?.split(" ")[0]}!`;
    subGreeting = "Continuing where you left off.";
  } else if (daysSinceLastVisit === 1) {
    greeting = `Welcome back, ${user.name?.split(" ")[0]}!`;
    subGreeting = "Great consistency — you were here yesterday too.";
  } else if (daysSinceLastVisit <= 3) {
    greeting = `Hey ${user.name?.split(" ")[0]}, nice to see you!`;
    if (moodTrend === "improving") {
      subGreeting = "Your mood has been trending up — keep it going!";
    } else {
      subGreeting = "Let's continue your wellness journey together.";
    }
  } else if (daysSinceLastVisit <= 7) {
    greeting = `Welcome back, ${user.name?.split(" ")[0]}! We missed you.`;
    subGreeting = `It's been ${daysSinceLastVisit} days. Let's catch up on your progress.`;
  } else if (daysSinceLastVisit <= 30) {
    greeting = `Great to have you back, ${user.name?.split(" ")[0]}!`;
    subGreeting = `It's been ${daysSinceLastVisit} days. Would you like to do a quick wellness check-in?`;
  } else {
    greeting = `Welcome back, ${user.name?.split(" ")[0]}! It's been a while.`;
    subGreeting = "No worries — let's ease back into your wellness routine together.";
  }

  // Suggested actions based on context
  const suggestedActions: { label: string; href: string; priority: number; reason: string }[] = [];

  if (upcomingAppointments.length > 0) {
    const next = upcomingAppointments[0];
    const hoursUntil = (new Date(next.dateTime).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntil <= 24) {
      suggestedActions.push({
        label: `Session with ${next.therapist.name} ${hoursUntil <= 1 ? "starting soon" : "today"}`,
        href: `/video-session/${next.id}`,
        priority: 1,
        reason: "upcoming_session",
      });
    }
  }

  if (daysSinceLastVisit >= 3 && moodRecords.length > 0) {
    suggestedActions.push({
      label: "Log today's mood",
      href: "/patient/progress",
      priority: 2,
      reason: "mood_check_in",
    });
  }

  if (unreadMessages > 0) {
    suggestedActions.push({
      label: `${unreadMessages} unread message${unreadMessages > 1 ? "s" : ""}`,
      href: "/patient/messages",
      priority: 3,
      reason: "unread_messages",
    });
  }

  if (enrollments.some((e) => e.progress > 0 && e.progress < 100)) {
    const inProgress = enrollments.find((e) => e.progress > 0 && e.progress < 100);
    if (inProgress) {
      suggestedActions.push({
        label: `Continue: ${inProgress.program.title} (${Math.round(inProgress.progress)}%)`,
        href: "/patient/programs",
        priority: 4,
        reason: "continue_program",
      });
    }
  }

  if (daysSinceLastVisit >= 7) {
    suggestedActions.push({
      label: "Chat with AI Wellness Assistant",
      href: "/patient/ai-chat",
      priority: 5,
      reason: "reconnect_ai",
    });
  }

  if (!upcomingAppointments.length && daysSinceLastVisit >= 14) {
    suggestedActions.push({
      label: "Book a therapy session",
      href: "/book",
      priority: 6,
      reason: "no_upcoming_sessions",
    });
  }

  return NextResponse.json({
    greeting,
    subGreeting,
    daysSinceLastVisit,
    moodSnapshot: { current: recentMood, trend: moodTrend },
    suggestedActions: suggestedActions.sort((a, b) => a.priority - b.priority),
    upcomingAppointments,
    activePrograms: enrollments,
    unreadMessages,
    unreadNotifications,
    aiMemories: aiMemories.map((m) => ({ category: m.category, content: m.content })),
    recentChatTopics: recentAIChats.map((c) => c.content.substring(0, 80)),
  });
}
