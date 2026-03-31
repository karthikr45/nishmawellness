"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  DollarSign, TrendingUp, Calendar, CreditCard,
  Download, Users, Clock, BarChart3,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  status: string;
  patient: { name: string };
}

export default function TherapistEarnings() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [hourlyRate, setHourlyRate] = useState(150);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/appointments")
        .then((r) => r.json())
        .then(setAppointments)
        .catch(console.error);

      fetch("/api/users/profile")
        .then((r) => r.json())
        .then((p) => { if (p.hourlyRate) setHourlyRate(p.hourlyRate); })
        .catch(console.error);
    }
  }, [status]);

  const completed = appointments.filter((a) => a.status === "COMPLETED");
  const totalHours = completed.reduce((s, a) => s + a.duration / 60, 0);
  const totalEarnings = completed.reduce((s, a) => s + (a.duration / 60) * hourlyRate, 0);
  const thisMonthCompleted = completed.filter((a) =>
    new Date(a.dateTime).getMonth() === new Date().getMonth()
  );
  const thisMonthEarnings = thisMonthCompleted.reduce((s, a) => s + (a.duration / 60) * hourlyRate, 0);
  const pendingPayout = thisMonthEarnings * 0.85; // 15% platform fee

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthlyData = months.map((_, i) => {
    const monthSessions = completed.filter((a) => new Date(a.dateTime).getMonth() === i);
    return monthSessions.reduce((s, a) => s + (a.duration / 60) * hourlyRate, 0);
  });
  const maxMonthly = Math.max(...monthlyData, 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-500 mt-1">Track your income and payouts</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Earnings", value: `$${totalEarnings.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: "bg-green-100 text-green-600" },
          { label: "This Month", value: `$${thisMonthEarnings.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
          { label: "Pending Payout", value: `$${pendingPayout.toFixed(0)}`, icon: <CreditCard className="w-5 h-5" />, color: "bg-purple-100 text-purple-600" },
          { label: "Hours Worked", value: `${totalHours.toFixed(0)}h`, icon: <Clock className="w-5 h-5" />, color: "bg-orange-100 text-orange-600" },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" /> Monthly Earnings
          </h2>
          <div className="flex items-end space-x-4 h-48">
            {monthlyData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full gradient-bg rounded-t-lg transition-all duration-500"
                  style={{ height: `${Math.max(4, (val / maxMonthly) * 100)}%` }}
                />
                <p className="text-xs text-gray-500 mt-2">{months[i]}</p>
                <p className="text-xs font-medium text-gray-700">${val.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Payout Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payout Details</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Hourly Rate</span>
                <span className="font-medium text-gray-900">${hourlyRate}/hr</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Platform Fee (15%)</span>
                <span className="text-gray-500">-${(thisMonthEarnings * 0.15).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t mt-2">
                <span className="font-medium text-gray-900">Net Payout</span>
                <span className="font-bold text-green-600">${pendingPayout.toFixed(0)}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm font-medium text-blue-800">Next Payout Date</p>
              <p className="text-sm text-blue-600 mt-1">
                {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-900">Bank Account</p>
              <p className="text-sm text-gray-500 mt-1">**** **** **** 7890 (Chase)</p>
              <Button size="sm" variant="outline" className="mt-2">Update Bank Details</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Completed Sessions</h2>
        <div className="space-y-2">
          {completed.slice(0, 10).map((apt) => (
            <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium text-xs">
                  {apt.patient.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{apt.patient.name}</p>
                  <p className="text-xs text-gray-500">{new Date(apt.dateTime).toLocaleDateString()} &middot; {apt.duration} min</p>
                </div>
              </div>
              <span className="font-medium text-green-600">
                +${((apt.duration / 60) * hourlyRate).toFixed(0)}
              </span>
            </div>
          ))}
          {completed.length === 0 && (
            <p className="text-center py-6 text-gray-500 text-sm">No completed sessions yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}
