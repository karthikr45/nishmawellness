"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Award, TrendingUp, FileText, Eye, MessageSquare,
  Users, BarChart3, Star, ArrowRight, CheckCircle,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Tooltip from "@/components/ui/tooltip";

interface ContinuityData {
  overallScore: number;
  scores: {
    id: string;
    score: number;
    contextUsage: number;
    noteCompleteness: number;
    followUpRate: number;
    patientRetention: number;
    patient: { id: string; name: string };
  }[];
}

export default function TherapistContinuity() {
  const { status } = useSession();
  const [data, setData] = useState<ContinuityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/continuity")
        .then((r) => r.json())
        .then((d) => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const recalculateAll = async () => {
    if (!data) return;
    setRecalculating(true);
    for (const score of data.scores) {
      await fetch("/api/continuity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: score.patient.id }),
      });
    }
    // Refresh
    const res = await fetch("/api/continuity");
    setData(await res.json());
    setRecalculating(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  }

  const scoreColor = (score: number) =>
    score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : score >= 40 ? "text-orange-600" : "text-red-600";

  const scoreLabel = (score: number) =>
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs Improvement" : "At Risk";

  const scoreBadge = (score: number) =>
    score >= 80 ? "success" as const : score >= 60 ? "warning" as const : "danger" as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            Continuity Score
            <Tooltip
              maxWidth={320}
              content="A 0-100 quality metric per patient. It blends four signals: how often you review patient context (25%), how complete your session notes are (25%), how often your notes reference earlier sessions (25%), and patient retention (25%). Higher scores correlate with better outcomes."
            />
          </h1>
          <p className="text-gray-500 mt-1">Track how well you maintain patient relationships</p>
        </div>
        <Button variant="outline" onClick={recalculateAll} loading={recalculating}>
          <BarChart3 className="w-4 h-4 mr-2" /> Recalculate
        </Button>
      </div>

      {/* Overall Score */}
      <Card className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="url(#gradient)" strokeWidth="3"
                  strokeDasharray={`${data?.overallScore || 0}, 100`}
                  strokeLinecap="round" />
                <defs>
                  <linearGradient id="gradient">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${scoreColor(data?.overallScore || 0)}`}>
                  {data?.overallScore || 0}
                </span>
                <span className="text-xs text-gray-500">out of 100</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {scoreLabel(data?.overallScore || 0)}
              </h2>
              <p className="text-gray-500 mt-1">
                Your overall continuity score across {data?.scores.length || 0} patients
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <Badge variant={scoreBadge(data?.overallScore || 0)}>
                  {scoreLabel(data?.overallScore || 0)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <Award className={`w-20 h-20 ${scoreColor(data?.overallScore || 0)} opacity-20`} />
          </div>
        </div>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Note Completeness",
            value: data?.scores.length ? Math.round(data.scores.reduce((s, sc) => s + sc.noteCompleteness, 0) / data.scores.length) : 0,
            icon: <FileText className="w-5 h-5" />,
            desc: "Session notes written after appointments",
            color: "bg-blue-100 text-blue-600",
          },
          {
            label: "Context Usage",
            value: data?.scores.length ? Math.round(data.scores.reduce((s, sc) => s + sc.contextUsage, 0) / data.scores.length) : 0,
            icon: <Eye className="w-5 h-5" />,
            desc: "Patient briefs reviewed before sessions",
            color: "bg-purple-100 text-purple-600",
          },
          {
            label: "Follow-Up Quality",
            value: data?.scores.length ? Math.round(data.scores.reduce((s, sc) => s + sc.followUpRate, 0) / data.scores.length) : 0,
            icon: <MessageSquare className="w-5 h-5" />,
            desc: "References to previous sessions in notes",
            color: "bg-green-100 text-green-600",
          },
          {
            label: "Patient Retention",
            value: data?.scores.length ? Math.round(data.scores.reduce((s, sc) => s + sc.patientRetention, 0) / data.scores.length) : 0,
            icon: <Users className="w-5 h-5" />,
            desc: "Patients who continue returning",
            color: "bg-orange-100 text-orange-600",
          },
        ].map((metric) => (
          <Card key={metric.label} className="p-5">
            <div className={`w-10 h-10 rounded-xl ${metric.color} flex items-center justify-center mb-3`}>
              {metric.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{metric.value}%</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{metric.label}</p>
            <p className="text-xs text-gray-400 mt-1">{metric.desc}</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
              <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${metric.value}%` }} />
            </div>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Tips to Improve Your Score</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: <Eye className="w-5 h-5" />, tip: "Review the Patient Brief before every session to recall key details and show patients you remember them." },
            { icon: <FileText className="w-5 h-5" />, tip: "Complete session notes immediately after each appointment while details are fresh." },
            { icon: <MessageSquare className="w-5 h-5" />, tip: "Reference previous sessions in your notes (e.g., 'As discussed last time...')." },
            { icon: <Star className="w-5 h-5" />, tip: "Update the patient context with new life events, triggers, and coping tools after each session." },
          ].map((item, i) => (
            <div key={i} className="flex items-start space-x-3 p-3 bg-white rounded-xl">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 flex-shrink-0">
                {item.icon}
              </div>
              <p className="text-sm text-gray-600">{item.tip}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Per-Patient Scores */}
      {data?.scores && data.scores.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient-Level Scores</h2>
          <div className="space-y-3">
            {data.scores.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                    {s.patient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{s.patient.name}</p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                      <span>Notes: {Math.round(s.noteCompleteness)}%</span>
                      <span>Context: {Math.round(s.contextUsage)}%</span>
                      <span>Follow-up: {Math.round(s.followUpRate)}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`text-xl font-bold ${scoreColor(s.score)}`}>{Math.round(s.score)}</p>
                    <Badge variant={scoreBadge(s.score)}>{scoreLabel(s.score)}</Badge>
                  </div>
                  <Link href={`/therapist/patient-brief?patientId=${s.patient.id}`}>
                    <Button size="sm" variant="outline">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
