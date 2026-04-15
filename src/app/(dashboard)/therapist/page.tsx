"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar, Users, Clock, Video, FileText, Brain,
  TrendingUp, Star, ArrowRight,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import TherapistWelcomeTour from "@/components/therapist/welcome-tour";

interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  type: string;
  status: string;
  patient: { id: string; name: string; email: string };
}

export default function TherapistDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role !== "THERAPIST") {
      router.push(`/${session?.user?.role?.toLowerCase()}`);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/appointments")
        .then((r) => r.json())
        .then(setAppointments)
        .catch(console.error);
    }
  }, [status]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  }

  const today = new Date();
  const todayAppointments = appointments.filter(
    (a) => new Date(a.dateTime).toDateString() === today.toDateString() && a.status !== "CANCELLED"
  );
  const upcoming = appointments.filter(
    (a) => new Date(a.dateTime) > today && a.status !== "CANCELLED"
  );
  const completed = appointments.filter((a) => a.status === "COMPLETED");
  const uniquePatients = new Set(appointments.map((a) => a.patient.id));

  return (
    <div className="space-y-8">
      {/* First-login 60-second tour explaining TwinClone, Patient Brief, Continuity Score */}
      <TherapistWelcomeTour />

      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {session?.user?.name?.split(" ")[0]}!</h1>
          <p className="text-gray-500 mt-1">Here&apos;s your practice overview</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Link href="/therapist/twinclone"><Button variant="secondary"><Brain className="w-4 h-4 mr-2" /> AI TwinClone</Button></Link>
          <Link href="/therapist/availability"><Button variant="outline"><Clock className="w-4 h-4 mr-2" /> Set Availability</Button></Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Sessions", value: todayAppointments.length, icon: <Calendar className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
          { label: "Total Patients", value: uniquePatients.size, icon: <Users className="w-5 h-5" />, color: "bg-green-100 text-green-600" },
          { label: "Completed Sessions", value: completed.length, icon: <TrendingUp className="w-5 h-5" />, color: "bg-purple-100 text-purple-600" },
          { label: "Avg Rating", value: "4.9", icon: <Star className="w-5 h-5" />, color: "bg-yellow-100 text-yellow-600" },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Today's Schedule */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h2>
          <Link href="/therapist/appointments" className="text-sm text-primary-600 hover:underline flex items-center">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No sessions scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                    {apt.patient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} &middot; {apt.duration} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={apt.status === "CONFIRMED" ? "success" : "info"}>{apt.status}</Badge>
                  <Link href={`/video-session/${apt.id}`}>
                    <Button size="sm"><Video className="w-4 h-4 mr-1" /> Start</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/therapist/notes">
          <Card hover className="p-6 cursor-pointer">
            <FileText className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Session Notes</h3>
            <p className="text-sm text-gray-500 mt-1">View and create session notes</p>
          </Card>
        </Link>
        <Link href="/therapist/patients">
          <Card hover className="p-6 cursor-pointer">
            <Users className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900">My Patients</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your patient list</p>
          </Card>
        </Link>
        <Link href="/therapist/twinclone">
          <Card hover className="p-6 cursor-pointer">
            <Brain className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900">AI TwinClone</h3>
            <p className="text-sm text-gray-500 mt-1">Configure your AI twin</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
