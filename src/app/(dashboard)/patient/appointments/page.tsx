"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Calendar, Clock, Video, X } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  type: string;
  status: string;
  notes?: string;
  meetingUrl?: string;
  therapist: { id: string; name: string; specialization: string };
}

export default function PatientAppointments() {
  const { status } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/appointments")
        .then((r) => r.json())
        .then(setAppointments)
        .catch(console.error);
    }
  }, [status]);

  const cancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: "CANCELLED" } : a));
  };

  const filtered = appointments.filter((a) => {
    if (filter === "upcoming") return new Date(a.dateTime) > new Date() && a.status !== "CANCELLED";
    if (filter === "past") return new Date(a.dateTime) <= new Date() || a.status === "COMPLETED";
    if (filter === "cancelled") return a.status === "CANCELLED";
    return true;
  });

  const statusBadge = (s: string) => {
    const map: Record<string, "success" | "warning" | "danger" | "info"> = {
      CONFIRMED: "success", SCHEDULED: "info", COMPLETED: "success",
      IN_PROGRESS: "warning", CANCELLED: "danger",
    };
    return map[s] || "default";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <Link href="/book">
          <Button className="mt-4 md:mt-0"><Calendar className="w-4 h-4 mr-2" /> Book New Session</Button>
        </Link>
      </div>

      <div className="flex space-x-2">
        {["all", "upcoming", "past", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? "bg-primary-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">No appointments found</p>
          <Link href="/book"><Button>Book Your First Session</Button></Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => (
            <Card key={apt.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center text-white font-medium">
                    {apt.therapist.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{apt.therapist.name}</h3>
                    <p className="text-sm text-gray-500">{apt.therapist.specialization}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{new Date(apt.dateTime).toLocaleDateString()}</span>
                      <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>{apt.duration} min</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                  <Badge variant={statusBadge(apt.status)}>{apt.status}</Badge>
                  {apt.status !== "CANCELLED" && apt.status !== "COMPLETED" && (
                    <>
                      {apt.type === "VIDEO" && new Date(apt.dateTime) > new Date() && (
                        <Link href={`/video-session/${apt.id}`}>
                          <Button size="sm"><Video className="w-4 h-4 mr-1" /> Join</Button>
                        </Link>
                      )}
                      <Button size="sm" variant="danger" onClick={() => cancelAppointment(apt.id)}>
                        <X className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
