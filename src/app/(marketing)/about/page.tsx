"use client";

import Link from "next/link";
import {
  Heart, Shield, Globe, Sparkles, ArrowRight,
  Brain, Building2,
} from "lucide-react";

const VALUES = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Continuity Over Novelty",
    desc: "Real wellness happens across months and years — not one-off chats. Every feature we build asks: does this support the long journey, or just the first session?",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Privacy Is Non-Negotiable",
    desc: "Individual data stays individual. Employers only ever see anonymous aggregates. Users can export or delete everything at any time. No exceptions.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Clinical Rigour",
    desc: "AI is a support layer, not a replacement for licensed care. Every guidance, assessment, and crisis response is reviewed against evidence-based practice.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Built for Everywhere",
    desc: "Mental health looks different in Mumbai than in Manhattan. Cultural context, 10 languages, and region-aware care are core to the product — not afterthoughts.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[60vh] flex items-center bg-[#1a1832] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1832] via-[#1e1d3a] to-[#141830]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#80A8FF]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#CEB5FF]/8 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20 text-center w-full">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-primary-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <Heart className="w-4 h-4 mr-2" /> Our Mission
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Wellness should
            <br />
            <span className="bg-gradient-to-r from-[#80A8FF] via-[#CEB5FF] to-[#8EC1DE] bg-clip-text text-transparent">
              remember you.
            </span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Most apps start every conversation from scratch. Nishma is built on one idea: the people who help you should remember your story — and the progress you have made.
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="py-24 bg-gradient-to-b from-white to-[#f8f7ff] dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 font-bold mb-3 text-center">Our Story</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-10">
            Why we built Nishma
          </h2>
          <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              Nishma Wellness began with a simple observation: most mental wellness tools ask you to tell your story again every time you open them.
            </p>
            <p>
              We watched people — family, friends, colleagues — struggle with the same pattern. A breakthrough with a therapist in March, followed by a cancelled session, followed by a new intake form in June. Progress lost. Patterns unnoticed. Support that forgot.
            </p>
            <p>
              We believed wellness platforms could work differently — that AI, if built carefully, could hold context between sessions, surface patterns across months, and help both individuals and their clinicians see the full picture.
            </p>
            <p>
              Nishma is that platform. It remembers what you said, tracks how you are changing, and connects the dots — so your next session starts where your last one ended.
            </p>
          </div>
        </div>
      </section>

      {/* FOUNDERS */}
      <section className="py-24 bg-gradient-to-b from-[#f8f7ff] to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 font-bold mb-3 text-center">The Team</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-14">
            Meet the founders
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: "Sesha Sai Nishma Kurapati",
                role: "Co-Founder",
                initials: "SN",
                bio: "Leading product vision and user experience. Focused on making mental wellness accessible across cultures, languages, and life stages — so every person, whether they are a student facing exam stress or a parent managing burnout, finds a platform that speaks to them.",
                focus: ["Product Strategy", "User Research", "Clinical Partnerships"],
              },
              {
                name: "Karthik Reddycharla",
                role: "Co-Founder",
                initials: "KR",
                bio: "Leading engineering and AI architecture. Building the memory systems, safety layer, and enterprise infrastructure that let Nishma scale from a single user's journal to an organisation's wellness dashboard — without compromising on privacy or performance.",
                focus: ["AI & Engineering", "Platform Architecture", "Enterprise Integrations"],
              },
            ].map((f) => (
              <div key={f.name} className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover-lift">
                <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-6">
                  {f.initials}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{f.name}</h3>
                <p className="text-primary-600 dark:text-primary-400 font-medium mt-1">{f.role}</p>
                <p className="mt-5 text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{f.bio}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {f.focus.map((item) => (
                    <span key={item} className="px-3 py-1 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Powered by MK Tech Monk */}
          <div className="mt-20 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-4">Powered By</p>
            <div className="inline-flex items-center space-x-3 px-8 py-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md">
              <Sparkles className="w-6 h-6 text-primary-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">MK Tech Monk</span>
            </div>
            <p className="mt-5 text-sm text-gray-500 max-w-xl mx-auto">
              The technology partner behind Nishma Wellness — bringing together AI, product design, and clinical thinking to build platforms that genuinely change lives.
            </p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 bg-gradient-to-b from-white to-[#f0f4ff] dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 font-bold mb-3">What We Believe</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Our values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-md mb-5">
                  {v.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{v.title}</h3>
                <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-[#f0f4ff] to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="gradient-bg rounded-[2rem] p-14 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Want to build this with us?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-lg mx-auto">
              We are growing — bringing on clinicians, engineers, and pilot companies who believe wellness should be continuous.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link href="/register" className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-colors flex items-center shadow-xl">
                Try Nishma <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/request-demo" className="px-8 py-4 border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors flex items-center">
                <Building2 className="w-5 h-5 mr-2" /> Book a Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
