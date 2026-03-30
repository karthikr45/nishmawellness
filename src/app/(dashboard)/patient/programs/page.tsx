"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BookOpen, Clock, Users, Star, CheckCircle } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: string;
  price: number;
  modules: string;
  _count: { enrollments: number };
}

export default function PatientPrograms() {
  const { status } = useSession();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/programs")
        .then((r) => r.json())
        .then(setPrograms)
        .catch(console.error);
    }
  }, [status]);

  const enroll = async (programId: string) => {
    setEnrolling(programId);
    try {
      const res = await fetch("/api/programs/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
      });
      if (res.ok) {
        setEnrolled((prev) => new Set([...prev, programId]));
      } else {
        const data = await res.json();
        alert(data.error || "Enrollment failed");
      }
    } catch (err) {
      console.error(err);
    }
    setEnrolling(null);
  };

  const categories = ["ALL", "MEDITATION", "YOGA", "MENTAL_HEALTH", "NUTRITION", "FITNESS", "STRESS_MANAGEMENT"];
  const filtered = filter === "ALL" ? programs : programs.filter((p) => p.category === filter);

  const categoryColors: Record<string, string> = {
    MEDITATION: "bg-purple-100 text-purple-700",
    YOGA: "bg-green-100 text-green-700",
    MENTAL_HEALTH: "bg-blue-100 text-blue-700",
    NUTRITION: "bg-orange-100 text-orange-700",
    FITNESS: "bg-red-100 text-red-700",
    STRESS_MANAGEMENT: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Training Programs</h1>
        <p className="text-gray-500 mt-1">Explore our curated wellness programs</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === cat ? "bg-primary-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"
            }`}
          >
            {cat === "ALL" ? "All" : cat.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((program) => {
          const modules = JSON.parse(program.modules);
          const isEnrolled = enrolled.has(program.id);

          return (
            <Card key={program.id} hover className="overflow-hidden">
              <div className={`h-2 ${program.category === "MEDITATION" ? "bg-purple-500" : program.category === "YOGA" ? "bg-green-500" : program.category === "FITNESS" ? "bg-red-500" : program.category === "NUTRITION" ? "bg-orange-500" : program.category === "MENTAL_HEALTH" ? "bg-blue-500" : "bg-yellow-500"}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={categoryColors[program.category] || ""}>
                    {program.category.replace("_", " ")}
                  </Badge>
                  <Badge variant="default">{program.level}</Badge>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{program.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{program.description}</p>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{program.duration}</span>
                  <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1" />{modules.length} modules</span>
                  <span className="flex items-center"><Users className="w-4 h-4 mr-1" />{program._count.enrollments + Math.floor(Math.random() * 100)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-900">${program.price}</p>
                  {isEnrolled ? (
                    <Button variant="outline" size="sm" disabled>
                      <CheckCircle className="w-4 h-4 mr-1" /> Enrolled
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      loading={enrolling === program.id}
                      onClick={() => enroll(program.id)}
                    >
                      Enroll Now
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
