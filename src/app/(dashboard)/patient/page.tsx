"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar, Brain, BookOpen, BarChart3, Video,
  ArrowRight, Clock, TrendingUp, TrendingDown, Bell,
  Sparkles, MessageSquare, Heart, Sun, Moon,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import GettingStartedChecklist from "@/components/patient/getting-started-checklist";
import WelcomeModal from "@/components/patient/welcome-modal";
import PrivacyBanner from "@/components/patient/privacy-banner";
import { PatientDashboardSkeleton } from "@/components/ui/skeleton";

interface ReturnContext {
  greeting: string;
  subGreeting: string;
  daysSinceLastVisit: number;
  moodSnapshot: { current: number | null; trend: string };
  suggestedActions: { label: string; href: string; priority: number; reason: string }[];
  upcomingAppointments: { id: string; dateTime: string; therapist: { name: string; specialization: string } }[];
  activePrograms: { progress: number; program: { title: string; category: string } }[];
  unreadMessages: number;
  unreadNotifications: number;
  aiMemories: { category: string; content: string }[];
  recentChatTopics: string[];
}

interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  type: string;
  status: string;
  therapist: { name: string; specialization: string };
}

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [returnContext, setReturnContext] = useState<ReturnContext | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; isRead: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role !== "PATIENT") {
      router.push(`/${session?.user?.role?.toLowerCase()}`);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/return-context").then((r) => r.json()),
        fetch("/api/appointments").then((r) => r.json()),
        fetch("/api/users/notifications").then((r) => r.json()),
      ]).then(([ctx, apts, notifs]) => {
        setReturnContext(ctx);
        setAppointments(apts);
        setNotifications(notifs);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return <PatientDashboardSkeleton />;
  }

  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.dateTime) > new Date() && a.status !== "CANCELLED"
  );

  const hour = new Date().getHours();
  const TimeIcon = hour < 12 ? Sun : hour < 18 ? Sun : Moon;

  const MoodTrendIcon = returnContext?.moodSnapshot.trend === "improving" ? TrendingUp
    : returnContext?.moodSnapshot.trend === "declining" ? TrendingDown : BarChart3;
  const moodColor = returnContext?.moodSnapshot.trend === "improving" ? "text-green-600"
    : returnContext?.moodSnapshot.trend === "declining" ? "text-red-600" : "text-gray-500";

  return (
    <div className="space-y-8">
      {/* Personalized Welcome */}
      <div className="relative overflow-hidden rounded-2xl gradient-bg p-8 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 right-10 w-40 h-40 rounded-full bg-white animate-float" />
          <div className="absolute bottom-5 left-20 w-24 h-24 rounded-full bg-white animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <TimeIcon className="w-5 h-5" />
            <span className="text-sm text-white/70">
              {hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {returnContext?.greeting || `Welcome back, ${session?.user?.name?.split(" ")[0]}!`}
          </h1>
          <p className="text-white/80 text-lg">
            {returnContext?.subGreeting || "Here's your wellness overview"}
          </p>

          {/* Mood snapshot */}
          {returnContext && returnContext.moodSnapshot.current !== null && (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                <Heart className="w-4 h-4" />
                <span className="text-sm">Mood: {returnContext.moodSnapshot.current}%</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                <MoodTrendIcon className="w-4 h-4" />
                <span className="text-sm capitalize">Trend: {returnContext.moodSnapshot.trend}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* First-run welcome modal — self-hides after first close */}
      <WelcomeModal />

      {/* Privacy banner for users who joined via company / campus */}
      <PrivacyBanner />

      {/* Getting Started Checklist — auto-hides when complete or dismissed */}
      <GettingStartedChecklist />

      {/* Smart Suggested Actions */}
      {returnContext?.suggestedActions && returnContext.suggestedActions.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
            <Sparkles className="w-4 h-4 mr-1" /> Suggested For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {returnContext.suggestedActions.slice(0, 3).map((action) => (
              <Link key={action.label} href={action.href}>
                <Card hover className="p-4 cursor-pointer border-l-4 border-l-primary-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                        {action.reason === "upcoming_session" ? <Video className="w-4 h-4" /> :
                         action.reason === "mood_check_in" ? <Heart className="w-4 h-4" /> :
                         action.reason === "unread_messages" ? <MessageSquare className="w-4 h-4" /> :
                         action.reason === "continue_program" ? <BookOpen className="w-4 h-4" /> :
                         action.reason === "reconnect_ai" ? <Brain className="w-4 h-4" /> :
                         <Calendar className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{action.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Calendar className="w-6 h-6" />, label: "Book Session", href: "/book", color: "bg-blue-100 text-blue-600" },
          { icon: <Brain className="w-6 h-6" />, label: "AI Chat", href: "/patient/ai-chat", color: "bg-purple-100 text-purple-600" },
          { icon: <BookOpen className="w-6 h-6" />, label: "Programs", href: "/patient/programs", color: "bg-green-100 text-green-600" },
          { icon: <BarChart3 className="w-6 h-6" />, label: "My Progress", href: "/patient/progress", color: "bg-orange-100 text-orange-600" },
        ].map((action) => (
          <Link key={action.label} href={action.href}>
            <Card hover className="p-5 text-center cursor-pointer">
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                {action.icon}
              </div>
              <p className="font-medium text-gray-900 text-sm">{action.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link href="/patient/appointments" className="text-sm text-primary-600 hover:underline flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No upcoming appointments</p>
                <Link href="/book">
                  <Button variant="outline" size="sm" className="mt-3">Book Now</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {apt.therapist.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{apt.therapist.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(apt.dateTime).toLocaleDateString()} at {new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={apt.status === "CONFIRMED" ? "success" : "info"}>{apt.status}</Badge>
                      {apt.status === "CONFIRMED" && apt.type === "VIDEO" && (
                        <Link href={`/video-session/${apt.id}`}>
                          <Button size="sm" variant="primary">
                            <Video className="w-3 h-3 mr-1" /> Join
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {returnContext && returnContext.unreadNotifications > 0 && (
                <Badge variant="danger">{returnContext.unreadNotifications} new</Badge>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-center py-4 text-gray-500 text-sm">No new notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n.id} className={`p-3 rounded-lg text-sm ${n.isRead ? "bg-gray-50" : "bg-primary-50 border border-primary-100"}`}>
                    <p className="font-medium text-gray-900">{n.title}</p>
                    <p className="text-gray-500 mt-1 text-xs">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* AI Memory - What We Know */}
          {returnContext?.aiMemories && returnContext.aiMemories.length > 0 && (
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Brain className="w-4 h-4 mr-2 text-secondary-600" /> Your Wellness Themes
              </h2>
              <div className="space-y-2">
                {returnContext.aiMemories.map((mem, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      mem.category === "TOPIC" ? "bg-blue-500" :
                      mem.category === "COPING" ? "bg-green-500" : "bg-purple-500"
                    }`} />
                    <span className="text-xs text-gray-600">{mem.content}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Active Programs */}
          {returnContext?.activePrograms && returnContext.activePrograms.length > 0 && (
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Active Programs</h2>
              {returnContext.activePrograms.map((prog, i) => (
                <div key={i} className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{prog.program.title}</span>
                    <span className="text-gray-500">{Math.round(prog.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${prog.progress}%` }} />
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      {/* Wellness Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Mood Score", value: returnContext?.moodSnapshot.current ? `${returnContext.moodSnapshot.current}%` : "—", trend: "", icon: <TrendingUp className="w-4 h-4" />, color: moodColor },
          { label: "Sessions Completed", value: String(appointments.filter((a) => a.status === "COMPLETED").length), trend: "", icon: <Calendar className="w-4 h-4" />, color: "text-blue-600" },
          { label: "Programs Active", value: String(returnContext?.activePrograms?.length || 0), trend: "", icon: <BookOpen className="w-4 h-4" />, color: "text-purple-600" },
          { label: "Unread Messages", value: String(returnContext?.unreadMessages || 0), trend: "", icon: <MessageSquare className="w-4 h-4" />, color: "text-orange-600" },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <span className={stat.color}>{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
