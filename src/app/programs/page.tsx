"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { BookOpen, Clock, Users, Star, CheckCircle, ArrowRight } from "lucide-react";
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

export default function ProgramsPage() {
  const { data: session } = useSession();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/programs").then((r) => r.json()).then(setPrograms).catch(console.error);
  }, []);

  const enroll = async (programId: string) => {
    if (!session) { window.location.href = "/login"; return; }
    setEnrolling(programId);
    try {
      const res = await fetch("/api/programs/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
      });
      if (res.ok) setEnrolled((prev) => new Set([...prev, programId]));
      else alert((await res.json()).error);
    } catch (err) { console.error(err); }
    setEnrolling(null);
  };

  const categories = ["ALL", "MEDITATION", "YOGA", "MENTAL_HEALTH", "NUTRITION", "FITNESS", "STRESS_MANAGEMENT"];
  const filtered = filter === "ALL" ? programs : programs.filter((p) => p.category === filter);

  const categoryColors: Record<string, string> = {
    MEDITATION: "bg-purple-500", YOGA: "bg-green-500", MENTAL_HEALTH: "bg-blue-500",
    NUTRITION: "bg-orange-500", FITNESS: "bg-red-500", STRESS_MANAGEMENT: "bg-yellow-500",
  };

  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-16 bg-gradient-to-b from-[#f0f4ff] via-[#f8f7ff] to-[#fafaff] relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-[#CEB5FF]/15 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Wellness Training Programs</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Expert-designed programs to transform your mental and physical well-being
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === cat ? "bg-primary-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}>
              {cat === "ALL" ? "All Programs" : cat.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((program) => {
            const modules = JSON.parse(program.modules);
            return (
              <Card key={program.id} hover className="overflow-hidden">
                <div className={`h-2 ${categoryColors[program.category] || "bg-gray-500"}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge>{program.category.replace("_", " ")}</Badge>
                    <Badge variant="info">{program.level}</Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{program.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{program.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{program.duration}</span>
                    <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1" />{modules.length} modules</span>
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <p className="text-xs font-medium text-gray-400 uppercase mb-2">Modules</p>
                    {modules.slice(0, 3).map((m: { title: string }, i: number) => (
                      <p key={i} className="text-xs text-gray-500 flex items-center py-1">
                        <CheckCircle className="w-3 h-3 mr-2 text-primary-500" />{m.title}
                      </p>
                    ))}
                    {modules.length > 3 && <p className="text-xs text-primary-600 mt-1">+{modules.length - 3} more modules</p>}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-gray-900">${program.price}</p>
                    {enrolled.has(program.id) ? (
                      <Button variant="outline" size="sm" disabled>
                        <CheckCircle className="w-4 h-4 mr-1" /> Enrolled
                      </Button>
                    ) : (
                      <Button size="sm" loading={enrolling === program.id} onClick={() => enroll(program.id)}>
                        Enroll Now <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      <Footer />
    </main>
  );
}
