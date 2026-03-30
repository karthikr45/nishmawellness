"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Calendar } from "lucide-react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";

interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  type: string;
  status: string;
  patient: { name: string; email: string };
  therapist: { name: string };
}

export default function AdminAppointments() {
  const { status } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/stats").then((r) => r.json()).then((data) => {
        setAppointments(data.recentAppointments || []);
      }).catch(console.error);
    }
  }, [status]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Appointments</h1>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Patient</th>
              <th className="px-6 py-3 font-medium">Therapist</th>
              <th className="px-6 py-3 font-medium">Date & Time</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{apt.patient.name}</td>
                <td className="px-6 py-4 text-gray-600">{apt.therapist.name}</td>
                <td className="px-6 py-4 text-gray-600">{new Date(apt.dateTime).toLocaleString()}</td>
                <td className="px-6 py-4"><Badge>{apt.type || "VIDEO"}</Badge></td>
                <td className="px-6 py-4">
                  <Badge variant={apt.status === "COMPLETED" ? "success" : apt.status === "CANCELLED" ? "danger" : "info"}>
                    {apt.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No appointments found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
