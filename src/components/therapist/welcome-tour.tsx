"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Sparkles, Brain, FileText, Eye, Award, X, ArrowRight, ArrowLeft,
} from "lucide-react";

const SHOWN_KEY = "nishma:therapist-tour-shown";

interface Step {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta?: { label: string; href: string };
}

const STEPS: Step[] = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Welcome to Nishma",
    body: "You are part of a network designed to support your patients between sessions and surface what matters when you sit down with them. Here is a quick 60-second tour of three features built specifically for you.",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Patient Brief",
    body: "Before each session, an AI-generated brief summarises your patient's recent journals, AI conversations, mood trends, and any concerns. Walk in already knowing what they have been carrying — they will feel heard from the first minute.",
    cta: { label: "Open Patient Brief", href: "/therapist/patient-brief" },
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "TwinClone Studio",
    body: "Configure an AI assistant trained on your therapeutic approach, tone, and signature techniques. It supports your patients between sessions while you stay in full control — review every conversation in Clone Oversight, refine its responses, or disable it entirely.",
    cta: { label: "Configure TwinClone", href: "/therapist/twinclone" },
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Continuity Score",
    body: "A 0-100 quality metric per patient that blends how often you review their context, how complete your notes are, how often your notes reference earlier sessions, and how well patients return. Higher scores correlate with better outcomes.",
    cta: { label: "See Your Continuity Score", href: "/therapist/continuity" },
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "You stay in control",
    body: "Every AI interaction with your patients is logged for your review. Crisis flags route to admin moderation. You can disable TwinClone or any individual feature at any time. The platform supports you — it never replaces your clinical judgement.",
  },
];

export default function TherapistWelcomeTour() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    const shown = typeof window !== "undefined" && localStorage.getItem(SHOWN_KEY) === "true";
    if (!shown) setOpen(true);
  }, [status]);

  const close = () => {
    localStorage.setItem(SHOWN_KEY, "true");
    setOpen(false);
  };

  if (!open) return null;

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;
  const isFirst = stepIdx === 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative gradient-bg p-8 text-white rounded-t-3xl">
          <button
            onClick={close}
            aria-label="Close tour"
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4">
            {step.icon}
          </div>
          <h2 className="text-2xl font-extrabold">{step.title}</h2>
          <p className="mt-3 text-white/85 text-sm leading-relaxed">{step.body}</p>
        </div>

        {/* Footer */}
        <div className="p-6">
          {/* Progress dots */}
          <div className="flex items-center justify-center space-x-2 mb-5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIdx ? "w-8 bg-primary-600" : "w-1.5 bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>

          {/* CTA for the current step */}
          {step.cta && (
            <Link href={step.cta.href} onClick={close}>
              <div className="mb-4 px-4 py-3 bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 rounded-xl flex items-center justify-between hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors cursor-pointer group">
                <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">{step.cta.label}</span>
                <ArrowRight className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between">
            {!isFirst ? (
              <button
                onClick={() => setStepIdx((i) => i - 1)}
                className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
            ) : (
              <button
                onClick={close}
                className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Skip tour
              </button>
            )}

            <button
              onClick={() => (isLast ? close() : setStepIdx((i) => i + 1))}
              className="px-5 py-2.5 gradient-bg text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center"
            >
              {isLast ? "Got it" : "Next"} <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
