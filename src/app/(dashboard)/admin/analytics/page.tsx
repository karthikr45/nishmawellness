"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BarChart3, TrendingUp, Users, Calendar, BookOpen, DollarSign } from "lucide-react";
import Card from "@/components/ui/card";

interface Stats {
  totalUsers: number;
  totalTherapists: number;
  totalPatients: number;
  totalAppointments: number;
  totalPrograms: number;
  totalEnrollments: number;
}

export default function AdminAnalytics() {
  const { status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(console.error);
    }
  }, [status]);

  if (!stats) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  const metrics = [
    { label: "Total Users", value: stats.totalUsers, change: "+12%", icon: <Users className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
    { label: "Active Therapists", value: stats.totalTherapists, change: "+8%", icon: <TrendingUp className="w-5 h-5" />, color: "bg-green-100 text-green-600" },
    { label: "Total Sessions", value: stats.totalAppointments, change: "+23%", icon: <Calendar className="w-5 h-5" />, color: "bg-purple-100 text-purple-600" },
    { label: "Program Enrollments", value: stats.totalEnrollments, change: "+15%", icon: <BookOpen className="w-5 h-5" />, color: "bg-orange-100 text-orange-600" },
  ];

  // Simulated monthly data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const sessionsData = [45, 62, 78, 95, 110, 134];
  const maxSessions = Math.max(...sessionsData);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center`}>{m.icon}</div>
              <span className="text-sm text-green-600 font-medium">{m.change}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Sessions</h2>
          <div className="flex items-end space-x-4 h-48">
            {sessionsData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full gradient-bg rounded-t-lg transition-all duration-500"
                  style={{ height: `${(val / maxSessions) * 100}%` }}
                />
                <p className="text-xs text-gray-500 mt-2">{months[i]}</p>
                <p className="text-xs font-medium text-gray-700">{val}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Overview</h2>
          <div className="space-y-4">
            {[
              { label: "Therapy Sessions", amount: "$12,450", pct: 60 },
              { label: "Program Enrollments", amount: "$8,230", pct: 35 },
              { label: "AI Chat (Premium)", amount: "$1,120", pct: 5 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-gray-900">{item.amount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="gradient-bg h-2 rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-4 border-t flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total Revenue</span>
              <span className="text-xl font-bold gradient-text">$21,800</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Growth</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Avg. Session Rating", value: "4.8/5", sub: "Based on 250+ reviews" },
            { label: "Session Completion Rate", value: "94%", sub: "6% cancellation" },
            { label: "Patient Retention", value: "87%", sub: "Month over month" },
            { label: "AI Chat Sessions", value: "1,240", sub: "This month" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-3xl font-bold gradient-text">{item.value}</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{item.label}</p>
              <p className="text-xs text-gray-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
