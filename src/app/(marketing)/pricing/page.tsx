"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check, ArrowRight, Sparkles, Building2, GraduationCap, Users,
  Heart, Video, Brain, Shield, MapPin, Star, Globe,
} from "lucide-react";

type Region = "US" | "IN";

const CURRENCY: Record<Region, { symbol: string; code: string }> = {
  US: { symbol: "$", code: "USD" },
  IN: { symbol: "₹", code: "INR" },
};

// ============================================
// INDIVIDUAL PLANS
// ============================================
const INDIVIDUAL_PLANS = {
  US: [
    {
      name: "Free",
      price: "0",
      period: "forever",
      annual: null,
      description: "Start your wellness journey — no credit card needed.",
      cta: "Get Started Free",
      href: "/register",
      popular: false,
      features: [
        "AI chat with memory (15 messages/day)",
        "Daily journal & mood tracking",
        "PHQ-9 & GAD-7 assessments (1/month)",
        "5 guided exercises (breathing, grounding)",
        "2 soundscapes (rain, ocean)",
        "Focus timer (all Pomodoro presets)",
        "Community forum (read only)",
        "Crisis support resources",
      ],
    },
    {
      name: "Plus",
      price: "12",
      period: "month",
      annual: "99",
      description: "Unlimited AI support, full content library, and deeper insights.",
      cta: "Start Plus",
      href: "/register",
      popular: true,
      features: [
        "Everything in Free",
        "Unlimited AI chat with deep memory",
        "All guided exercises & meditations",
        "Full program library",
        "All sleep stories & soundscapes",
        "Weekly insights & trend reports",
        "Progress tracking over time",
        "Unlimited assessments",
        "Community forum (read + post)",
        "Neighbourhood community",
        "Career Explorer & Interview Prep",
        "Achievements & streaks",
      ],
    },
    {
      name: "Plus Family",
      price: "24",
      period: "month",
      annual: "239",
      description: "Everything in Plus for your whole household — up to 5 members.",
      cta: "Start Family Plan",
      href: "/register",
      popular: false,
      features: [
        "Everything in Plus for up to 5 members",
        "Family group with shared goals",
        "Couples module (daily check-ins, shared journal, love languages)",
        "Per-member privacy controls",
        "Minor-safe mode for children",
        "Each member has their own private account",
      ],
    },
  ],
  IN: [
    {
      name: "Free",
      price: "0",
      period: "forever",
      annual: null,
      description: "Start your wellness journey — no credit card needed.",
      cta: "Get Started Free",
      href: "/register",
      popular: false,
      features: [
        "AI chat with memory (15 messages/day)",
        "Daily journal & mood tracking",
        "PHQ-9 & GAD-7 assessments (1/month)",
        "5 guided exercises (breathing, grounding)",
        "2 soundscapes (rain, ocean)",
        "Focus timer (all Pomodoro presets)",
        "Community forum (read only)",
        "Crisis support resources",
      ],
    },
    {
      name: "Plus",
      price: "399",
      period: "month",
      annual: "3,499",
      description: "Unlimited AI support, full content library, and deeper insights.",
      cta: "Start Plus",
      href: "/register",
      popular: true,
      features: [
        "Everything in Free",
        "Unlimited AI chat with deep memory",
        "All guided exercises & meditations",
        "Full program library",
        "All sleep stories & soundscapes",
        "Weekly insights & trend reports",
        "Progress tracking over time",
        "Unlimited assessments",
        "Community forum (read + post)",
        "Neighbourhood community",
        "Career Explorer & Interview Prep",
        "Achievements & streaks",
      ],
    },
    {
      name: "Plus Family",
      price: "999",
      period: "month",
      annual: "9,999",
      description: "Everything in Plus for your whole household — up to 5 members.",
      cta: "Start Family Plan",
      href: "/register",
      popular: false,
      features: [
        "Everything in Plus for up to 5 members",
        "Family group with shared goals",
        "Couples module (daily check-ins, shared journal, love languages)",
        "Per-member privacy controls",
        "Minor-safe mode for children",
        "Each member has their own private account",
      ],
    },
  ],
};

// ============================================
// THERAPY ADD-ON
// ============================================
const THERAPY = {
  US: { single: 79, pack3: 213, pack3Each: 71, pack5: 335, pack5Each: 67, couples: 99, student: 49 },
  IN: { single: 999, pack3: 2699, pack3Each: 900, pack5: 4249, pack5Each: 850, couples: 1499, student: 699 },
};

// ============================================
// B2B ENTERPRISE TIERS
// ============================================
const B2B_TIERS = {
  US: [
    { tier: "Starter", size: "50–200", pepm: 3, sessions: "Pay per session", perSession: 89, features: ["AI + journal + exercises for all employees", "HR dashboard + analytics", "Anonymous feedback", "Employee invite system"], highlight: false },
    { tier: "Growth", size: "200–1,000", pepm: 5, sessions: "4 / employee / year included", perSession: 79, features: ["Everything in Starter", "Wellness heatmap by department", "Burnout prediction + alerts", "Critical incident tracking"], highlight: true },
    { tier: "Scale", size: "1,000–5,000", pepm: 7, sessions: "8 / employee / year included", perSession: 69, features: ["Everything in Growth", "Peer recognition wall", "Challenges + leaderboard", "Custom programs", "Dedicated CSM"], highlight: false },
    { tier: "Enterprise", size: "5,000+", pepm: null, sessions: "12 / employee / year + custom", perSession: 59, features: ["Everything in Scale", "SSO + API integration", "HIPAA BAA (US)", "Multi-region deployment", "Custom branding + SLA", "Onsite training"], highlight: false },
  ],
  IN: [
    { tier: "Starter", size: "50–200", pepm: 100, sessions: "Pay per session", perSession: 999, features: ["AI + journal + exercises for all employees", "HR dashboard + analytics", "Anonymous feedback", "Employee invite system"], highlight: false },
    { tier: "Growth", size: "200–1,000", pepm: 150, sessions: "4 / employee / year included", perSession: 799, features: ["Everything in Starter", "Wellness heatmap by department", "Burnout prediction + alerts", "Critical incident tracking"], highlight: true },
    { tier: "Scale", size: "1,000–5,000", pepm: 220, sessions: "8 / employee / year included", perSession: 599, features: ["Everything in Growth", "Peer recognition wall", "Challenges + leaderboard", "Custom programs", "Dedicated CSM"], highlight: false },
    { tier: "Enterprise", size: "5,000+", pepm: null, sessions: "12 / employee / year + custom", perSession: 499, features: ["Everything in Scale", "SSO + API integration", "Multi-region deployment", "Custom branding + SLA", "Onsite training"], highlight: false },
  ],
};

// ============================================
// STUDENT
// ============================================
const STUDENT = {
  US: { price: "4.99", annual: "49" },
  IN: { price: "149", annual: "1,499" },
};

// ============================================
// FAQ
// ============================================
const FAQS = [
  { q: "Is the Free plan really free?", a: "Yes. No credit card needed. You get AI chat with memory, journaling, mood tracking, 5 exercises, and assessments — for as long as you want." },
  { q: "What happens when I book a therapy session?", a: "Therapy is a separate add-on, not bundled into your subscription. Book one-off sessions or buy a discounted pack. You get matched to a licensed therapist, video session via Jitsi, and your therapist sees an AI-prepared brief before every session." },
  { q: "Who can see my data on a company plan?", a: "Only you. Your employer sees anonymous aggregate statistics — like overall wellness trends by department. Your individual journal, AI chats, assessment scores, and therapy notes are never visible to HR or your manager." },
  { q: "What is TwinClone?", a: "After your first session with a therapist who has it enabled, their AI clone becomes available to you between sessions. It reflects their therapeutic approach and supports you 24/7 — but it is not a replacement for real therapy." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel Plus or Family from your Billing page. You keep access until the end of your billing period. No cancellation fees." },
  { q: "What does the company pay vs. what the employee pays?", a: "The company pays a per-employee-per-month (PEPM) base that covers the platform. Therapy sessions are either included in the company plan (Growth/Scale/Enterprise) or billed per use. Employees never pay out of pocket on a company plan unless they want services beyond what the plan covers." },
  { q: "Do you offer a pilot program?", a: "Yes. Our first design partners get 90 days free + 50% off the first year. This lets you prove ROI before committing budget. Request a demo to discuss." },
];

// ============================================
// COMPONENT
// ============================================
export default function PricingPage() {
  const [region, setRegion] = useState<Region>("IN");
  const c = CURRENCY[region];
  const plans = INDIVIDUAL_PLANS[region];
  const therapy = THERAPY[region];
  const b2b = B2B_TIERS[region];
  const student = STUDENT[region];

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[50vh] flex items-center bg-[#1a1832] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1832] via-[#1e1d3a] to-[#141830]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#80A8FF]/10 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-16 text-center w-full">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-primary-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" /> Simple, Honest Pricing
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Pay only for
            <br />
            <span className="bg-gradient-to-r from-[#80A8FF] via-[#CEB5FF] to-[#8EC1DE] bg-clip-text text-transparent">
              what helps you.
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
            Start free. Add therapy when you are ready. Cancel anytime.
          </p>

          {/* Region toggle */}
          <div className="mt-8 inline-flex items-center bg-white/10 rounded-full p-1">
            {(["IN", "US"] as Region[]).map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`flex items-center px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  region === r ? "bg-white text-gray-900 shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                <Globe className="w-4 h-4 mr-1.5" />
                {r === "IN" ? "India (₹)" : "United States ($)"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* INDIVIDUAL PLANS */}
      <section className="py-20 bg-gradient-to-b from-white to-[#f8f7ff] dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 font-bold mb-3">For Individuals &amp; Families</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Self-help plans</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">Subscription covers AI, content, and tools. Therapy sessions are a separate add-on — so you never pay for what you don&apos;t use.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-gray-800 rounded-3xl p-8 border flex flex-col ${
                  plan.popular
                    ? "border-primary-500 shadow-2xl shadow-primary-500/10 md:scale-105"
                    : "border-gray-100 dark:border-gray-700"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 gradient-bg text-white text-xs font-bold rounded-full shadow-md">MOST POPULAR</span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1 min-h-[40px]">{plan.description}</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white">{c.symbol}{plan.price}</span>
                  <span className="ml-2 text-gray-500">/{plan.period}</span>
                </div>
                {plan.annual && (
                  <p className="text-sm text-primary-600 dark:text-primary-400 mt-2">
                    or {c.symbol}{plan.annual}/year (save ~17%)
                  </p>
                )}

                <Link
                  href={plan.href}
                  className={`mt-6 block text-center px-5 py-3 rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? "gradient-bg text-white hover:opacity-90"
                      : "border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="mt-8 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start space-x-2.5 text-sm">
                      <Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THERAPY ADD-ON */}
      <section className="py-20 bg-gradient-to-b from-[#f8f7ff] to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 font-bold mb-3">Add Therapy When Ready</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Video sessions with licensed therapists</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">Therapy is separate from your subscription. Book one-off or save with session packs. Your therapist sees an AI-prepared brief before every session.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 text-center">
              <Video className="w-8 h-8 text-primary-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Single Session</h3>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-4">{c.symbol}{therapy.single}</p>
              <p className="text-sm text-gray-500 mt-1">50-minute video session</p>
              <ul className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-300 text-left">
                <li className="flex items-start space-x-2"><Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" /><span>Goal-based therapist matching</span></li>
                <li className="flex items-start space-x-2"><Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" /><span>Secure video via Jitsi</span></li>
                <li className="flex items-start space-x-2"><Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" /><span>AI Patient Brief for your therapist</span></li>
                <li className="flex items-start space-x-2"><Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" /><span>TwinClone support between sessions</span></li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-primary-500 shadow-xl text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 gradient-bg text-white text-xs font-bold rounded-full shadow-md">SAVE 10%</span>
              </div>
              <Star className="w-8 h-8 text-primary-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">3-Session Pack</h3>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-4">{c.symbol}{therapy.pack3}</p>
              <p className="text-sm text-gray-500 mt-1">{c.symbol}{therapy.pack3Each} per session</p>
              <p className="text-xs text-primary-600 dark:text-primary-400 mt-2">Most chosen by new patients</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 text-center">
              <Heart className="w-8 h-8 text-primary-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">5-Session Pack</h3>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-4">{c.symbol}{therapy.pack5}</p>
              <p className="text-sm text-gray-500 mt-1">{c.symbol}{therapy.pack5Each} per session</p>
              <p className="text-xs text-green-600 mt-2">Save 15%</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="px-4 py-2 bg-pink-50 dark:bg-pink-950 rounded-xl text-sm text-pink-700 dark:text-pink-300">
              <Heart className="w-4 h-4 inline mr-1" /> Couples session: {c.symbol}{therapy.couples}
            </div>
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950 rounded-xl text-sm text-blue-700 dark:text-blue-300">
              <GraduationCap className="w-4 h-4 inline mr-1" /> Student rate: {c.symbol}{therapy.student}/session
            </div>
          </div>
        </div>
      </section>

      {/* STUDENT */}
      <section className="py-20 bg-gradient-to-b from-white to-[#f0f4ff] dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-secondary-600 dark:text-secondary-400 font-bold mb-3">For Students</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Student Plus</h2>
          </div>

          <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-white mx-auto mb-5">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="flex items-baseline justify-center">
              <span className="text-5xl font-extrabold text-gray-900 dark:text-white">{c.symbol}{student.price}</span>
              <span className="ml-2 text-gray-500">/month</span>
            </div>
            <p className="text-sm text-primary-600 dark:text-primary-400 mt-2">or {c.symbol}{student.annual}/year</p>
            <p className="text-gray-500 mt-4 text-sm">Everything in Plus + Career Explorer + Interview Prep + Academic Wellness + student therapy rate</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <Link href="/student-signup" className="px-6 py-3 gradient-bg text-white rounded-xl font-semibold hover:opacity-90 flex items-center">
                Student Sign Up <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link href="/join-campus" className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
                My campus has Nishma →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* B2B ENTERPRISE */}
      <section className="py-20 bg-gradient-to-b from-[#f0f4ff] to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-accent-600 dark:text-accent-400 font-bold mb-3">For Companies &amp; Campuses</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Enterprise wellness</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Low monthly base per employee covers the platform. Therapy sessions included or billed per use depending on tier. HR sees only anonymous aggregate data.
            </p>
          </div>

          {/* Pilot banner */}
          <div className="mb-10 p-5 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 rounded-2xl border border-primary-200 dark:border-primary-800 text-center">
            <p className="text-primary-800 dark:text-primary-200 font-semibold">
              <Sparkles className="w-4 h-4 inline mr-1" /> Pilot program: First 90 days free + 50% off year 1 for our first design partners.
            </p>
            <Link href="/request-demo" className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium mt-1 inline-block">
              Request a demo to discuss →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {b2b.map((tier) => (
              <div
                key={tier.tier}
                className={`bg-white dark:bg-gray-800 rounded-3xl p-7 border flex flex-col ${
                  tier.highlight ? "border-primary-500 shadow-xl" : "border-gray-100 dark:border-gray-700"
                }`}
              >
                {tier.highlight && (
                  <span className="px-3 py-1 gradient-bg text-white text-xs font-bold rounded-full self-start shadow-md mb-4">MOST CHOSEN</span>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tier.tier}</h3>
                <p className="text-xs text-gray-500 mt-1">{tier.size} employees</p>

                <div className="mt-5 flex items-baseline">
                  {tier.pepm ? (
                    <>
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{c.symbol}{tier.pepm}</span>
                      <span className="ml-1 text-sm text-gray-500">/employee/month</span>
                    </>
                  ) : (
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">Custom</span>
                  )}
                </div>

                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Therapy sessions</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{tier.sessions}</p>
                  <p className="text-xs text-gray-400 mt-1">Overage: {c.symbol}{tier.perSession}/session</p>
                </div>

                <ul className="mt-5 space-y-2.5 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start space-x-2 text-sm">
                      <Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/request-demo"
                  className={`mt-6 block text-center px-5 py-3 rounded-xl font-semibold transition-colors ${
                    tier.highlight
                      ? "gradient-bg text-white hover:opacity-90"
                      : "border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {tier.pepm ? "Request Demo" : "Talk to Sales"} <ArrowRight className="w-4 h-4 inline ml-1" />
                </Link>
              </div>
            ))}
          </div>

          {/* What every tier includes */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-5 text-center">Every company tier includes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
              {[
                { icon: <Brain className="w-4 h-4" />, text: "AI chat for all employees" },
                { icon: <Shield className="w-4 h-4" />, text: "100% anonymized HR analytics" },
                { icon: <Users className="w-4 h-4" />, text: "Employee invite system" },
                { icon: <Heart className="w-4 h-4" />, text: "Family + couples access" },
                { icon: <MapPin className="w-4 h-4" />, text: "Neighbourhood community" },
                { icon: <GraduationCap className="w-4 h-4" />, text: "Career + academic tools" },
                { icon: <Building2 className="w-4 h-4" />, text: "Anonymous feedback inbox" },
                { icon: <Star className="w-4 h-4" />, text: "Peer recognition wall" },
              ].map((item) => (
                <div key={item.text} className="flex items-center space-x-2">
                  <span className="text-primary-500">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gradient-to-b from-white to-[#f0f4ff] dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-12">
            Questions?
          </h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.q}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-[#f0f4ff] to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="gradient-bg rounded-[2rem] p-14 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Not sure where to start?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-lg mx-auto">
              Start free. Add therapy when you are ready. Cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link href="/register" className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-colors flex items-center shadow-xl">
                Start Free <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/request-demo" className="px-8 py-4 border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors flex items-center">
                <Building2 className="w-5 h-5 mr-2" /> Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
