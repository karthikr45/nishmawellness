"use client";

import Link from "next/link";
import {
  Check, ArrowRight, Sparkles, Building2, GraduationCap, Users, Heart,
} from "lucide-react";

const INDIVIDUAL_PLANS = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    description: "Start your wellness journey — no credit card needed.",
    cta: "Get Started Free",
    href: "/register",
    popular: false,
    features: [
      "AI chat with memory (limited messages)",
      "Daily journal & mood tracking",
      "5 guided exercises",
      "PHQ-9 & GAD-7 assessments",
      "Community access",
      "Crisis support resources",
    ],
  },
  {
    name: "Plus",
    price: "9",
    period: "month",
    description: "Unlimited AI support and deeper insights.",
    cta: "Start Plus Trial",
    href: "/register",
    popular: true,
    features: [
      "Everything in Free",
      "Unlimited AI chat with deep memory",
      "All guided exercises & meditations",
      "Full program library",
      "Weekly insights & trend reports",
      "Sleep & focus tools",
      "Email support",
    ],
  },
  {
    name: "Premium",
    price: "29",
    period: "month",
    description: "Includes live therapy sessions with licensed therapists.",
    cta: "Start Premium Trial",
    href: "/register",
    popular: false,
    features: [
      "Everything in Plus",
      "2 video therapy sessions / month",
      "Priority therapist matching",
      "AI TwinClone (therapist\u2019s AI between sessions)",
      "Session handoff summaries",
      "Family plan add-on available",
      "Priority support",
    ],
  },
];

const SEGMENT_PLANS = [
  {
    icon: <GraduationCap className="w-7 h-7" />,
    name: "Student",
    price: "\u20B9149",
    period: "month",
    description: "Mental health support built for exam stress, placements, and campus life.",
    cta: "Student Sign Up",
    href: "/student-signup",
    alt: "Free with a campus plan",
    altHref: "/join-campus",
  },
  {
    icon: <Heart className="w-7 h-7" />,
    name: "Family",
    price: "29",
    period: "month for up to 5 members",
    description: "Shared wellness plan for partners, children, and parents.",
    cta: "Start Family Plan",
    href: "/register",
    alt: "Minor-safe mode included",
    altHref: "/register",
  },
  {
    icon: <Building2 className="w-7 h-7" />,
    name: "Company / Enterprise",
    price: "Custom",
    period: "per employee",
    description: "Burnout prediction, HR analytics, pulse surveys, and peer recognition for your whole organisation.",
    cta: "Request a Demo",
    href: "/company-signup",
    alt: "Pilot programs available",
    altHref: "/company-signup",
  },
];

export default function PricingPage() {
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
            Start free. Upgrade when you are ready. Cancel anytime.
          </p>
        </div>
      </section>

      {/* INDIVIDUAL PLANS */}
      <section className="py-20 bg-gradient-to-b from-white to-[#f8f7ff] dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 font-bold mb-3">For Individuals</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Choose your plan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INDIVIDUAL_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-gray-800 rounded-3xl p-8 border ${
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
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white">${plan.price}</span>
                  <span className="ml-2 text-gray-500">/{plan.period}</span>
                </div>

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

                <ul className="mt-8 space-y-3">
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

      {/* SEGMENT PLANS */}
      <section className="py-20 bg-gradient-to-b from-[#f8f7ff] to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 font-bold mb-3">Specialised Plans</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Students, Families & Companies</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SEGMENT_PLANS.map((p) => (
              <div key={p.name} className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 hover-lift flex flex-col">
                <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-md mb-5">
                  {p.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{p.name}</h3>
                <p className="text-sm text-gray-500 mt-1 min-h-[48px]">{p.description}</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{p.price}</span>
                  <span className="ml-2 text-sm text-gray-500">/{p.period}</span>
                </div>
                <Link
                  href={p.href}
                  className="mt-6 text-center px-5 py-3 gradient-bg text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  {p.cta} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link href={p.altHref} className="mt-3 text-center text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  {p.alt}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ STRIP */}
      <section className="py-20 bg-gradient-to-b from-white to-[#f0f4ff] dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-12">
            Questions?
          </h2>
          <div className="space-y-5">
            {[
              {
                q: "Is the Free plan really free?",
                a: "Yes. No credit card needed. You get access to AI chat, journaling, mood tracking, 5 guided exercises, and assessments — for as long as you want.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel Plus or Premium from your Billing page. You keep access until the end of your current billing period.",
              },
              {
                q: "Are therapy sessions with real licensed therapists?",
                a: "Yes. Therapists on Nishma hold valid licenses in their jurisdiction. We verify credentials before they join the platform.",
              },
              {
                q: "Who can see my data?",
                a: "Only you. Even on a company plan, your employer only sees anonymous aggregate statistics — never your individual journal, chat, or assessment data.",
              },
              {
                q: "What is the Company plan pricing?",
                a: "Company pricing is customised by team size, features, and session volume. Reach out for a pilot or demo.",
              },
            ].map((f) => (
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
              Start on the Free plan. Upgrade when Nishma becomes part of your routine.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link href="/register" className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-colors flex items-center shadow-xl">
                Start Free <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/company-signup" className="px-8 py-4 border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors flex items-center">
                <Users className="w-5 h-5 mr-2" /> Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
