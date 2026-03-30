"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Users, Calendar, Clock, Video, DollarSign,
  CheckCircle, Star, Search, MapPin, Repeat,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface GroupSession {
  id: string;
  title: string;
  description: string;
  category: string;
  dateTime: string;
  duration: number;
  maxParticipants: number;
  price: number;
  isRecurring: boolean;
  recurrence?: string;
  status: string;
  tags: string;
  host: { id: string; name: string; specialization: string };
  _count: { members: number };
}

const categoryColors: Record<string, string> = {
  SUPPORT_GROUP: "bg-blue-100 text-blue-700",
  WORKSHOP: "bg-green-100 text-green-700",
  WEBINAR: "bg-purple-100 text-purple-700",
  MEDITATION_CIRCLE: "bg-orange-100 text-orange-700",
};

const categoryLabels: Record<string, string> = {
  SUPPORT_GROUP: "Support Group",
  WORKSHOP: "Workshop",
  WEBINAR: "Webinar",
  MEDITATION_CIRCLE: "Meditation Circle",
};

export default function PatientGroups() {
  const { status } = useSession();
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [joining, setJoining] = useState<string | null>(null);
  const [joined, setJoined] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/group-sessions").then((r) => r.json()).then(setSessions).catch(console.error);
    }
  }, [status]);

  const joinSession = async (sessionId: string) => {
    setJoining(sessionId);
    try {
      const res = await fetch("/api/group-sessions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupSessionId: sessionId }),
      });
      if (res.ok) {
        setJoined((prev) => new Set([...prev, sessionId]));
      } else {
        const data = await res.json();
        alert(data.error || "Could not join session");
      }
    } catch (err) { console.error(err); }
    setJoining(null);
  };

  const categories = ["ALL", "SUPPORT_GROUP", "WORKSHOP", "WEBINAR", "MEDITATION_CIRCLE"];
  const filtered = sessions
    .filter((s) => filter === "ALL" || s.category === filter)
    .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Group Sessions & Workshops</h1>
        <p className="text-gray-500 mt-1">Join group therapy, workshops, and wellness circles</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === cat ? "bg-primary-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}>
              {cat === "ALL" ? "All" : categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((session) => {
          const spotsLeft = session.maxParticipants - session._count.members;
          const isFull = spotsLeft <= 0;
          const isJoined = joined.has(session.id);
          const tags = JSON.parse(session.tags || "[]");

          return (
            <Card key={session.id} hover className="overflow-hidden">
              <div className={`h-1.5 ${session.category === "SUPPORT_GROUP" ? "bg-blue-500" : session.category === "WORKSHOP" ? "bg-green-500" : session.category === "WEBINAR" ? "bg-purple-500" : "bg-orange-500"}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={categoryColors[session.category] || ""}>
                    {categoryLabels[session.category] || session.category}
                  </Badge>
                  {session.isRecurring && (
                    <span className="flex items-center text-xs text-gray-400">
                      <Repeat className="w-3 h-3 mr-1" /> {session.recurrence}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{session.description}</p>

                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {session.host.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.host.name}</p>
                    <p className="text-xs text-gray-500">{session.host.specialization}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />
                    {new Date(session.dateTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />
                    {new Date(session.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span>{session.duration} min</span>
                  <span className="flex items-center"><Users className="w-4 h-4 mr-1" />
                    {session._count.members}/{session.maxParticipants}
                  </span>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    {session.price === 0 ? (
                      <Badge variant="success">Free</Badge>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">${session.price}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isFull && (
                      <span className="text-xs text-green-600">{spotsLeft} spots left</span>
                    )}
                    {isJoined ? (
                      <Button size="sm" variant="outline" disabled>
                        <CheckCircle className="w-4 h-4 mr-1" /> Registered
                      </Button>
                    ) : isFull ? (
                      <Button size="sm" variant="outline" disabled>Full</Button>
                    ) : (
                      <Button size="sm" loading={joining === session.id} onClick={() => joinSession(session.id)}>
                        <Video className="w-4 h-4 mr-1" /> Join
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No group sessions available right now</p>
        </Card>
      )}
    </div>
  );
}
