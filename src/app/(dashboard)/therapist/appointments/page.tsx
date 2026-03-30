"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Calendar, Clock, Video, Check, X } from "lucide-react";
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
  patient: { id: string; name: string; email: string };
}

export default function TherapistAppointments() {
  const { status } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState("upcoming");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/appointments")
        .then((r) => r.json())
        .then(setAppointments)
        .catch(console.error);
    }
  }, [status]);

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const filtered = appointments.filter((a) => {
    if (filter === "upcoming") return new Date(a.dateTime) > new Date() && a.status !== "CANCELLED";
    if (filter === "today") return new Date(a.dateTime).toDateString() === new Date().toDateString();
    if (filter === "completed") return a.status === "COMPLETED";
    return true;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>

      <div className="flex space-x-2">
        {["upcoming", "today", "completed", "all"].map((f) => (
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

      <div className="space-y-4">
        {filtered.map((apt) => (
          <Card key={apt.id} className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium text-lg">
                  {apt.patient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{apt.patient.name}</h3>
                  <p className="text-sm text-gray-500">{apt.patient.email}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{new Date(apt.dateTime).toLocaleDateString()}</span>
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span>{apt.duration} min &middot; {apt.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <Badge variant={apt.status === "CONFIRMED" ? "success" : apt.status === "CANCELLED" ? "danger" : "info"}>
                  {apt.status}
                </Badge>
                {apt.status === "SCHEDULED" && (
                  <>
                    <Button size="sm" variant="primary" onClick={() => updateStatus(apt.id, "CONFIRMED")}>
                      <Check className="w-4 h-4 mr-1" /> Confirm
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => updateStatus(apt.id, "CANCELLED")}>
                      <X className="w-4 h-4 mr-1" /> Decline
                    </Button>
                  </>
                )}
                {apt.status === "CONFIRMED" && apt.type === "VIDEO" && (
                  <a href={`/video-session/${apt.id}`}>
                    <Button size="sm"><Video className="w-4 h-4 mr-1" /> Start</Button>
                  </a>
                )}
                {apt.status === "CONFIRMED" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(apt.id, "COMPLETED")}>
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No appointments found</p>
          </Card>
        )}
      </div>
    </div>
  );
}
