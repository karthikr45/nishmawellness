"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle, Circle, Sparkles, X, ArrowRight,
  PenLine, Brain, ClipboardList, Calendar, Wind,
} from "lucide-react";
import Card from "@/components/ui/card";

interface GettingStarted {
  hasJournaled: boolean;
  hasChatted: boolean;
  hasAssessed: boolean;
  hasBookedSession: boolean;
  hasExercised: boolean;
  completedCount: number;
  totalCount: number;
}

const DISMISS_KEY = "nishma:getting-started-dismissed";

export default function GettingStartedChecklist() {
  const [data, setData] = useState<GettingStarted | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wasDismissed = typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "true";
    setDismissed(wasDismissed);
    fetch("/api/users/getting-started")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  if (loading || !data || dismissed) return null;
  // Hide when fully complete — they've graduated.
  if (data.completedCount >= data.totalCount) return null;

  const steps = [
    {
      key: "hasChatted",
      done: data.hasChatted,
      icon: <Brain className="w-5 h-5" />,
      label: "Have your first AI chat",
      desc: "Say hi — the AI will remember.",
      href: "/patient/ai-chat",
    },
    {
      key: "hasJournaled",
      done: data.hasJournaled,
      icon: <PenLine className="w-5 h-5" />,
      label: "Log your first mood entry",
      desc: "Takes under a minute. Builds your trend line.",
      href: "/patient/journal",
    },
    {
      key: "hasAssessed",
      done: data.hasAssessed,
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Take a wellness assessment",
      desc: "PHQ-9 or GAD-7 — see where you stand.",
      href: "/patient/assessments",
    },
    {
      key: "hasExercised",
      done: data.hasExercised,
      icon: <Wind className="w-5 h-5" />,
      label: "Try a guided exercise",
      desc: "5-minute breathing or body scan.",
      href: "/patient/exercises",
    },
    {
      key: "hasBookedSession",
      done: data.hasBookedSession,
      icon: <Calendar className="w-5 h-5" />,
      label: "Book your first therapist session",
      desc: "When you feel ready. No pressure.",
      href: "/patient/appointments",
    },
  ];

  const nextStep = steps.find((s) => !s.done);
  const progressPct = Math.round((data.completedCount / data.totalCount) * 100);

  return (
    <Card className="p-6 border-2 border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Getting started</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {data.completedCount} of {data.totalCount} done &middot; most users start with AI chat
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss checklist"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="w-full bg-white/60 dark:bg-gray-800/60 rounded-full h-1.5 overflow-hidden">
          <div
            className="gradient-bg h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Next step highlight */}
      {nextStep && (
        <Link href={nextStep.href}>
          <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-primary-200 dark:border-primary-800 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white">
                {nextStep.icon}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary-600 dark:text-primary-400 font-bold">Next step</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{nextStep.label}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      )}

      {/* All steps */}
      <div className="space-y-2">
        {steps.map((s) => (
          <Link key={s.key} href={s.href}>
            <div className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
              s.done
                ? "bg-transparent"
                : "bg-white/50 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800"
            }`}>
              <div className="flex items-center space-x-3">
                {s.done ? (
                  <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${s.done ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"}`}>
                    {s.label}
                  </p>
                  {!s.done && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.desc}</p>
                  )}
                </div>
              </div>
              {!s.done && <ArrowRight className="w-4 h-4 text-gray-400" />}
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
