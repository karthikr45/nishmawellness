"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Video, Calendar, Clock } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  status: string;
  type: string;
  therapist: { name: string; specialization: string };
}

export default function PatientVideoSessions() {
  const { status } = useSession();
  const [sessions, setSessions] = useState<Appointment[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/appointments")
        .then((r) => r.json())
        .then((data: Appointment[]) => setSessions(data.filter((a) => a.type === "VIDEO")))
        .catch(console.error);
    }
  }, [status]);

  const upcoming = sessions.filter(
    (s) => new Date(s.dateTime) > new Date() && s.status !== "CANCELLED"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Sessions</h1>
          <p className="text-gray-500 mt-1">Join or manage your video therapy sessions</p>
        </div>
        <Link href="/book"><Button><Video className="w-4 h-4 mr-2" /> Book Video Session</Button></Link>
      </div>

      {upcoming.length > 0 && (
        <Card className="p-6 border-2 border-primary-200 bg-primary-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ready to Join</h2>
          {upcoming.slice(0, 1).map((s) => (
            <div key={s.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center text-white">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{s.therapist.name}</p>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{new Date(s.dateTime).toLocaleDateString()}</span>
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{new Date(s.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              </div>
              <Link href={`/video-session/${s.id}`}>
                <Button size="lg"><Video className="w-5 h-5 mr-2" /> Join Session</Button>
              </Link>
            </div>
          ))}
        </Card>
      )}

      <div className="space-y-4">
        {sessions.map((s) => (
          <Card key={s.id} className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{s.therapist.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(s.dateTime).toLocaleDateString()} at {new Date(s.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" "}&middot; {s.duration} min
                  </p>
                </div>
              </div>
              <Badge variant={s.status === "COMPLETED" ? "success" : s.status === "CANCELLED" ? "danger" : "info"}>
                {s.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
