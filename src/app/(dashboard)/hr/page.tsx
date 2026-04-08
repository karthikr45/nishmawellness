"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart3, Users, Heart, TrendingUp, DollarSign,
  Calendar, BookOpen, Wind, PenLine, Building2,
  ArrowUp, ArrowDown, Minus, Shield, CheckCircle,
} from "lucide-react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";

interface HRData {
  organization: { name: string; plan: string; totalMembers: number; maxEmployees: number };
  metrics: { totalSessions: number; avgMoodScore: number | null; engagementRate: number; activeUsers: number; totalEnrollments: number; exercisesCompleted: number; journalEntries: number };
  departments: Record<string, { count: number; sessionsUsed: number }>;
  roi: { sickDaysReduced: number; productivityGain: string; estimatedSavings: number; costPerEmployee: number };
  monthlyTrend: { month: string; engagement: number; mood: number }[];
}

export default function HRDashboard() {
  const { status } = useSession();
  const [data, setData] = useState<HRData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      // Get org ID from membership
      fetch("/api/organization")
        .then((r) => r.json())
        .then((orgs) => {
          const orgId = Array.isArray(orgs) ? orgs[0]?.id : orgs?.organization?.id;
          if (orgId) {
            return fetch(`/api/hr?orgId=${orgId}`).then((r) => r.json());
          }
          return null;
        })
        .then((d) => { if (d) setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  if (!data) return (
    <div className="text-center py-16">
      <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">HR Dashboard</h2>
      <p className="text-gray-500">No organization found. Contact admin to set up your company&apos;s wellness program.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{data.organization.name} — HR Dashboard</h1>
          <p className="text-gray-500 mt-1">Employee wellness analytics (all data anonymized)</p>
        </div>
        <Badge variant="info">{data.organization.plan}</Badge>
      </div>

      {/* Privacy Notice */}
      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-xl flex items-center space-x-2 text-sm text-green-700 dark:text-green-300">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <span>All data is anonymized. Individual employee sessions, journals, and chats are never visible to HR.</span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Engagement Rate", value: `${data.metrics.engagementRate}%`, icon: <TrendingUp className="w-5 h-5" />, color: "bg-green-100 text-green-600" },
          { label: "Active Users", value: `${data.metrics.activeUsers}/${data.organization.totalMembers}`, icon: <Users className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
          { label: "Avg Mood Score", value: data.metrics.avgMoodScore ? `${data.metrics.avgMoodScore}%` : "—", icon: <Heart className="w-5 h-5" />, color: "bg-pink-100 text-pink-600" },
          { label: "Sessions Completed", value: String(data.metrics.totalSessions), icon: <Calendar className="w-5 h-5" />, color: "bg-purple-100 text-purple-600" },
        ].map((m) => (
          <Card key={m.label} className="p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.color} mb-3`}>{m.icon}</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{m.value}</p>
            <p className="text-xs text-gray-500">{m.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI Calculator */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" /> Wellness ROI
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-xl">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Estimated Annual Savings</p>
                <p className="text-3xl font-bold text-green-600">${data.roi.estimatedSavings.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{data.roi.sickDaysReduced}</p>
                <p className="text-xs text-gray-500">Sick Days Reduced</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{data.roi.productivityGain}</p>
                <p className="text-xs text-gray-500">Productivity Gain</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Based on industry averages: 2.5 fewer sick days and 8% productivity increase per engaged employee.</p>
          </div>
        </Card>

        {/* Monthly Trend Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" /> Monthly Trends
          </h2>
          <div className="flex items-end justify-between h-40 px-2">
            {data.monthlyTrend.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="flex-1 w-full flex items-end justify-center space-x-1 px-1">
                  <div className="w-full max-w-[14px] gradient-bg rounded-t-lg" style={{ height: `${m.engagement}%` }}
                    title={`Engagement: ${m.engagement}%`} />
                  <div className="w-full max-w-[14px] bg-pink-400 rounded-t-lg" style={{ height: `${m.mood}%` }}
                    title={`Mood: ${m.mood}%`} />
                </div>
                <p className="text-xs text-gray-500 mt-2">{m.month}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center"><div className="w-3 h-3 gradient-bg rounded mr-1" /> Engagement</span>
            <span className="flex items-center"><div className="w-3 h-3 bg-pink-400 rounded mr-1" /> Avg Mood</span>
          </div>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Department Breakdown (Anonymized)</h2>
        <div className="space-y-3">
          {Object.entries(data.departments).map(([dept, stats]) => {
            const deptEngagement = stats.count > 0 ? Math.round((stats.sessionsUsed > 0 ? 1 : 0) / stats.count * 100) : 0;
            return (
              <div key={dept} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {dept.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{dept}</p>
                    <p className="text-xs text-gray-500">{stats.count} employees</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{stats.sessionsUsed} sessions</p>
                    <p className="text-xs text-gray-500">{deptEngagement}% engagement</p>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="gradient-bg h-2 rounded-full" style={{ width: `${Math.min(100, deptEngagement)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Program Enrollments", value: data.metrics.totalEnrollments, icon: <BookOpen className="w-5 h-5" /> },
          { label: "Exercises Completed", value: data.metrics.exercisesCompleted, icon: <Wind className="w-5 h-5" /> },
          { label: "Journal Entries", value: data.metrics.journalEntries, icon: <PenLine className="w-5 h-5" /> },
          { label: "Seat Utilization", value: `${Math.round((data.organization.totalMembers / data.organization.maxEmployees) * 100)}%`, icon: <Users className="w-5 h-5" /> },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <div className="text-gray-400 flex justify-center mb-2">{s.icon}</div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
