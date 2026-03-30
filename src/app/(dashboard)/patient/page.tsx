"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar, Brain, BookOpen, BarChart3, Video,
  ArrowRight, Clock, TrendingUp, Bell,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  type: string;
  status: string;
  therapist: { name: string; specialization: string };
}

interface Enrollment {
  id: string;
  progress: number;
  program: { title: string; category: string };
}

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; isRead: boolean }[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role !== "PATIENT") {
      router.push(`/${session?.user?.role?.toLowerCase()}`);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/appointments")
        .then((r) => r.json())
        .then(setAppointments)
        .catch(console.error);

      fetch("/api/users/notifications")
        .then((r) => r.json())
        .then(setNotifications)
        .catch(console.error);

      fetch("/api/programs/enroll")
        .catch(() => {});
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.dateTime) > new Date() && a.status !== "CANCELLED"
  );

  const quickActions = [
    { icon: <Calendar className="w-6 h-6" />, label: "Book Session", href: "/book", color: "bg-blue-100 text-blue-600" },
    { icon: <Brain className="w-6 h-6" />, label: "AI Chat", href: "/patient/ai-chat", color: "bg-purple-100 text-purple-600" },
    { icon: <BookOpen className="w-6 h-6" />, label: "Programs", href: "/patient/programs", color: "bg-green-100 text-green-600" },
    { icon: <BarChart3 className="w-6 h-6" />, label: "My Progress", href: "/patient/progress", color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s your wellness overview</p>
        </div>
        <Link href="/book">
          <Button className="mt-4 md:mt-0">
            <Video className="w-4 h-4 mr-2" /> Book a Session
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
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

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          {notifications.length === 0 ? (
            <p className="text-center py-6 text-gray-500 text-sm">No new notifications</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className={`p-3 rounded-lg text-sm ${n.isRead ? "bg-gray-50" : "bg-primary-50 border border-primary-100"}`}>
                  <p className="font-medium text-gray-900">{n.title}</p>
                  <p className="text-gray-500 mt-1">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Wellness Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Mood Score", value: "78%", trend: "+5%", icon: <TrendingUp className="w-4 h-4" />, color: "text-green-600" },
          { label: "Sleep Quality", value: "82%", trend: "+3%", icon: <TrendingUp className="w-4 h-4" />, color: "text-green-600" },
          { label: "Sessions Completed", value: String(appointments.filter((a) => a.status === "COMPLETED").length), trend: "", icon: <Calendar className="w-4 h-4" />, color: "text-blue-600" },
          { label: "Programs Active", value: String(enrollments.length || 2), trend: "", icon: <BookOpen className="w-4 h-4" />, color: "text-purple-600" },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              {stat.trend && (
                <span className={`flex items-center text-sm ${stat.color}`}>
                  {stat.icon}
                  <span className="ml-1">{stat.trend}</span>
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
