"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Sparkles, Brain, PenLine, Wind, Calendar, ClipboardList,
  Moon, Shield, Users, Target, X, ArrowRight,
} from "lucide-react";

const SHOWN_KEY = "nishma:welcome-shown";

interface OnboardingResponse {
  // The API returns primaryGoals as a JSON-encoded string from the DB column.
  // We parse defensively below so either shape works.
  primaryGoals?: string[] | string;
}

interface Suggestion {
  href: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  reason: string;
}

const GOAL_TO_SUGGESTION: Record<string, Suggestion> = {
  anxiety: {
    href: "/patient/exercises",
    label: "Try a 5-minute breathing exercise",
    desc: "Built specifically for anxiety relief — works in the moment.",
    icon: <Wind className="w-5 h-5" />,
    reason: "Most people with anxiety find quick relief in guided breathing.",
  },
  depression: {
    href: "/patient/assessments",
    label: "Take the PHQ-9 wellness check",
    desc: "5-minute baseline so we can track how you change.",
    icon: <ClipboardList className="w-5 h-5" />,
    reason: "Knowing your starting point helps you see real progress.",
  },
  sleep: {
    href: "/patient/sleep",
    label: "Open the Sleep & Sounds toolkit",
    desc: "Soundscapes and guided relaxation that work tonight.",
    icon: <Moon className="w-5 h-5" />,
    reason: "Better sleep tonight is the fastest mood-booster tomorrow.",
  },
  stress: {
    href: "/patient/exercises",
    label: "Try the 4-7-8 breathing reset",
    desc: "Activates your parasympathetic system in under 2 minutes.",
    icon: <Wind className="w-5 h-5" />,
    reason: "Designed for high-stress moments — works at your desk.",
  },
  relationships: {
    href: "/patient/ai-chat",
    label: "Talk it through with the AI",
    desc: "A safe space to think out loud — and the AI remembers.",
    icon: <Brain className="w-5 h-5" />,
    reason: "Naming the dynamic is the first step to changing it.",
  },
  mindfulness: {
    href: "/patient/exercises",
    label: "Start with a body scan",
    desc: "10-minute guided meditation — perfect first practice.",
    icon: <Wind className="w-5 h-5" />,
    reason: "The classic entry point into mindfulness practice.",
  },
  career: {
    href: "/patient/career",
    label: "Open the Career Explorer",
    desc: "Find directions that match your strengths and values.",
    icon: <Target className="w-5 h-5" />,
    reason: "Career stress often eases once direction is clearer.",
  },
  family: {
    href: "/patient/family",
    label: "Set up your family wellness group",
    desc: "Share goals with people who love you. Privacy you control.",
    icon: <Users className="w-5 h-5" />,
    reason: "Wellness sticks better with shared support.",
  },
  trauma: {
    href: "/patient/appointments",
    label: "Book a session with a licensed therapist",
    desc: "Trauma work is best done with a real human in your corner.",
    icon: <Calendar className="w-5 h-5" />,
    reason: "AI is a companion — for trauma, we recommend a clinician early.",
  },
  grief: {
    href: "/patient/journal",
    label: "Open the journal",
    desc: "Writing what you feel is one of the most studied grief practices.",
    icon: <PenLine className="w-5 h-5" />,
    reason: "Putting words to loss helps the mind process it.",
  },
};

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    href: "/patient/ai-chat",
    label: "Have your first AI chat",
    desc: "Just say hi. The AI will get to know you.",
    icon: <Brain className="w-5 h-5" />,
    reason: "Most users start here.",
  },
  {
    href: "/patient/journal",
    label: "Log your first mood entry",
    desc: "Takes under a minute. Builds your trend line.",
    icon: <PenLine className="w-5 h-5" />,
    reason: "Daily check-ins are the foundation of everything.",
  },
  {
    href: "/patient/exercises",
    label: "Try a guided breathing exercise",
    desc: "5 minutes. No prep. Try it now.",
    icon: <Wind className="w-5 h-5" />,
    reason: "Quick win to feel the product working.",
  },
];

export default function WelcomeModal() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(DEFAULT_SUGGESTIONS);
  const [primaryGoal, setPrimaryGoal] = useState<string>("");

  useEffect(() => {
    if (status !== "authenticated") return;
    const alreadyShown = localStorage.getItem(SHOWN_KEY) === "true";
    if (alreadyShown) return;

    fetch("/api/onboarding")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: OnboardingResponse | null) => {
        // primaryGoals comes back as a JSON-encoded string from the DB.
        let goals: string[] = [];
        const raw = data?.primaryGoals;
        if (Array.isArray(raw)) {
          goals = raw;
        } else if (typeof raw === "string" && raw.length > 0) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) goals = parsed;
          } catch {
            /* ignore malformed value */
          }
        }
        if (goals.length > 0) {
          setPrimaryGoal(goals[0]);
          const personalized = goals
            .slice(0, 3)
            .map((g) => GOAL_TO_SUGGESTION[g])
            .filter(Boolean) as Suggestion[];
          // Pad with defaults if fewer than 3 personalized
          const merged: Suggestion[] = [...personalized];
          for (const def of DEFAULT_SUGGESTIONS) {
            if (merged.length >= 3) break;
            if (!merged.find((m) => m.href === def.href)) merged.push(def);
          }
          setSuggestions(merged.slice(0, 3));
        }
        setOpen(true);
      })
      .catch(() => setOpen(true));
  }, [status]);

  const close = () => {
    localStorage.setItem(SHOWN_KEY, "true");
    setOpen(false);
  };

  if (!open) return null;

  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const goalLabel = primaryGoal
    ? primaryGoal.charAt(0).toUpperCase() + primaryGoal.slice(1).replace(/-/g, " ")
    : "";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative gradient-bg p-8 text-white rounded-t-3xl">
          <button
            onClick={close}
            aria-label="Close welcome"
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold">
            You&apos;re all set{firstName ? `, ${firstName}` : ""}.
          </h2>
          <p className="mt-2 text-white/80 text-sm leading-relaxed">
            {goalLabel
              ? `Based on your goals around ${goalLabel.toLowerCase()}, here are 3 great places to start:`
              : "Here are 3 great places to start:"}
          </p>
        </div>

        {/* Suggestions */}
        <div className="p-6 space-y-3">
          {suggestions.map((s, idx) => (
            <Link key={s.href + idx} href={s.href} onClick={close}>
              <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white shadow-sm">
                      {s.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{s.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5" />
            <span>Everything you share is private.</span>
          </div>
          <button
            onClick={close}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
