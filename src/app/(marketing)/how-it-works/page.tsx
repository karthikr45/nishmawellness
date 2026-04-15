"use client";

import Link from "next/link";
import {
  UserPlus, ClipboardCheck, Brain, Video, TrendingUp,
  ArrowRight, CheckCircle, Sparkles,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: <UserPlus className="w-7 h-7" />,
    title: "Sign up in 30 seconds",
    desc: "Create your account with your email. Choose whether you are an individual, student, or joining through your company.",
    bullets: ["No credit card required", "Free to start", "Private by default"],
  },
  {
    number: "02",
    icon: <ClipboardCheck className="w-7 h-7" />,
    title: "Tell us about you",
    desc: "A short 8-step questionnaire captures your goals, current stress level, sleep, therapy preferences, and concerns. This personalises everything that follows.",
    bullets: ["Goals across 12 wellness areas", "Stress & sleep baseline", "Emergency contact setup"],
  },
  {
    number: "03",
    icon: <Brain className="w-7 h-7" />,
    title: "Start where you are",
    desc: "Talk to our AI companion, take an evidence-based assessment (PHQ-9, GAD-7), journal your day, or try a guided breathing exercise. The AI remembers everything you share.",
    bullets: ["AI chat that builds memory", "Daily journal", "Guided exercises & meditations"],
  },
  {
    number: "04",
    icon: <Video className="w-7 h-7" />,
    title: "Connect with a therapist",
    desc: "When you are ready, book a licensed therapist matched to your goals. Video sessions from anywhere. Your therapist sees a handoff brief of your progress so every session starts informed.",
    bullets: ["Goal-based therapist matching", "Secure video sessions", "Patient brief prepared automatically"],
  },
  {
    number: "05",
    icon: <TrendingUp className="w-7 h-7" />,
    title: "See your growth",
    desc: "Weekly insights, mood trends, assessment progress, and streak-based achievements show you how you are changing. Share selectively with family or your therapist.",
    bullets: ["Mood & wellness trends", "Assessment scores over time", "Achievements & streaks"],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[60vh] flex items-center bg-[#1a1832] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1832] via-[#1e1d3a] to-[#141830]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#80A8FF]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#CEB5FF]/8 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20 text-center w-full">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-primary-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" /> How Nishma Works
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Five steps to
            <br />
            <span className="bg-gradient-to-r from-[#80A8FF] via-[#CEB5FF] to-[#8EC1DE] bg-clip-text text-transparent">
              wellness that remembers.
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
            From your first sign-up to your hundredth session — here is what the journey looks like.
          </p>
        </div>
      </section>

      {/* STEPS */}
      <section className="py-24 bg-gradient-to-b from-white to-[#f8f7ff] dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-5xl mx-auto px-6 space-y-20">
          {STEPS.map((step, idx) => (
            <div key={step.number} className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${idx % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""}`}>
              <div>
                <div className="inline-flex items-center justify-center w-14 h-14 gradient-bg rounded-2xl text-white shadow-lg mb-5">
                  {step.icon}
                </div>
                <p className="text-sm font-bold text-primary-600 dark:text-primary-400 tracking-widest mb-2">STEP {step.number}</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  {step.title}
                </h2>
                <p className="mt-4 text-lg text-gray-500 leading-relaxed">{step.desc}</p>
                <ul className="mt-6 space-y-3">
                  {step.bullets.map((b) => (
                    <li key={b} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl p-10 flex items-center justify-center min-h-[280px]">
                <div className="text-center">
                  <div className="text-8xl font-extrabold bg-gradient-to-r from-[#80A8FF] via-[#CEB5FF] to-[#8EC1DE] bg-clip-text text-transparent">
                    {step.number}
                  </div>
                  <p className="mt-4 text-sm text-gray-400 uppercase tracking-[0.15em]">{step.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-[#f8f7ff] to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="gradient-bg rounded-[2rem] p-14 text-center text-white relative overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Ready to start your journey?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-lg mx-auto">
              Free to try. No credit card required. Your wellness companion is waiting.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link href="/register" className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-colors flex items-center shadow-xl">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/pricing" className="px-8 py-4 border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors">
                See Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
