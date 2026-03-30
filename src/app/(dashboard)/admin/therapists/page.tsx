"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserPlus, Check, X, Clock } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface TherapistData {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  isActive: boolean;
  createdAt: string;
  _count: { therapistAppointments: number };
}

export default function AdminTherapists() {
  const { status } = useSession();
  const [therapists, setTherapists] = useState<TherapistData[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/users?role=THERAPIST").then((r) => r.json()).then(setTherapists).catch(console.error);
    }
  }, [status]);

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    setTherapists((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: !isActive } : t)));
  };

  const pending = therapists.filter((t) => !t.isActive);
  const active = therapists.filter((t) => t.isActive);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Therapist Management</h1>

      {pending.length > 0 && (
        <Card className="p-6 border-2 border-yellow-200 bg-yellow-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-600" /> Pending Approval ({pending.length})
          </h2>
          <div className="space-y-4">
            {pending.map((t) => (
              <div key={t.id} className="flex items-center justify-between bg-white p-4 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-medium">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.email} &middot; {t.specialization}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="primary" onClick={() => toggleActive(t.id, false)}>
                    <Check className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="danger"><X className="w-4 h-4 mr-1" /> Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Therapists ({active.length})</h2>
        <div className="space-y-3">
          {active.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-medium">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.specialization}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">{t._count.therapistAppointments} sessions</span>
                <Badge variant="success">Active</Badge>
                <Button size="sm" variant="danger" onClick={() => toggleActive(t.id, true)}>Deactivate</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
