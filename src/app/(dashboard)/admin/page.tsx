"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, Calendar, BookOpen, TrendingUp,
  ArrowRight, BarChart3, UserPlus, Activity,
} from "lucide-react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";

interface Stats {
  totalUsers: number;
  totalTherapists: number;
  totalPatients: number;
  totalAppointments: number;
  totalPrograms: number;
  totalEnrollments: number;
  recentAppointments: {
    id: string;
    dateTime: string;
    status: string;
    patient: { name: string };
    therapist: { name: string };
  }[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push(`/${session?.user?.role?.toLowerCase()}`);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(console.error);
    }
  }, [status]);

  if (!stats) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: <Users className="w-6 h-6" />, color: "bg-blue-100 text-blue-600", href: "/admin/users" },
    { label: "Therapists", value: stats.totalTherapists, icon: <UserPlus className="w-6 h-6" />, color: "bg-green-100 text-green-600", href: "/admin/therapists" },
    { label: "Patients", value: stats.totalPatients, icon: <Activity className="w-6 h-6" />, color: "bg-purple-100 text-purple-600", href: "/admin/users?role=PATIENT" },
    { label: "Appointments", value: stats.totalAppointments, icon: <Calendar className="w-6 h-6" />, color: "bg-orange-100 text-orange-600", href: "/admin/appointments" },
    { label: "Programs", value: stats.totalPrograms, icon: <BookOpen className="w-6 h-6" />, color: "bg-pink-100 text-pink-600", href: "/admin/programs" },
    { label: "Enrollments", value: stats.totalEnrollments, icon: <TrendingUp className="w-6 h-6" />, color: "bg-yellow-100 text-yellow-600", href: "/admin/programs" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className="p-5 cursor-pointer">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Appointments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
          <Link href="/admin/appointments" className="text-sm text-primary-600 hover:underline flex items-center">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        {stats.recentAppointments.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No appointments yet</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
              Once patients start booking sessions with therapists, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">Patient</th>
                  <th className="pb-3 font-medium">Therapist</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAppointments.map((apt) => (
                  <tr key={apt.id} className="border-b last:border-0">
                    <td className="py-3 font-medium text-gray-900">{apt.patient.name}</td>
                    <td className="py-3 text-gray-600">{apt.therapist.name}</td>
                    <td className="py-3 text-gray-600">{new Date(apt.dateTime).toLocaleDateString()}</td>
                    <td className="py-3">
                      <Badge variant={apt.status === "COMPLETED" ? "success" : apt.status === "CANCELLED" ? "danger" : "info"}>
                        {apt.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/users">
          <Card hover className="p-6 cursor-pointer">
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-500 mt-1">Activate, deactivate, and manage user accounts</p>
          </Card>
        </Link>
        <Link href="/admin/therapists">
          <Card hover className="p-6 cursor-pointer">
            <UserPlus className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Approve Therapists</h3>
            <p className="text-sm text-gray-500 mt-1">Review and approve therapist registrations</p>
          </Card>
        </Link>
        <Link href="/admin/analytics">
          <Card hover className="p-6 cursor-pointer">
            <BarChart3 className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-500 mt-1">View platform usage statistics</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
