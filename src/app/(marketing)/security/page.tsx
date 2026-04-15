"use client";

import Link from "next/link";
import {
  Shield, Lock, Key, Eye, FileText, AlertTriangle,
  CheckCircle, Clock, Server, Users, ArrowRight, Mail,
} from "lucide-react";

const PROTECTIONS = [
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Encryption in Transit",
    desc: "All traffic between your device and Nishma is encrypted via TLS 1.3. No session data is transmitted in the clear.",
  },
  {
    icon: <Key className="w-6 h-6" />,
    title: "Secure Authentication",
    desc: "Passwords are hashed with bcrypt before storage. Sessions use signed JWTs with short expiry. Multi-factor authentication is on our roadmap.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Role-Based Access",
    desc: "Patients, therapists, HR admins, and organisation admins each see only the data relevant to their role. Access is enforced at the API layer.",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Comprehensive Audit Logs",
    desc: "Every safety-critical event — crisis detections, consent changes, moderation flags, data exports — is logged with severity, category, and timestamp.",
  },
  {
    icon: <Server className="w-6 h-6" />,
    title: "Isolated Database",
    desc: "We use PostgreSQL with network-level isolation. Employer-side analytics run on aggregate queries only — never individual records.",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Content Moderation",
    desc: "A safety layer screens every AI conversation for crisis, medical, and harmful content. High-severity events are queued for human review.",
  },
];

const PRIVACY_PROMISES = [
  "Your employer (if you joined through a company plan) sees only anonymous aggregate statistics — never your individual journal, AI chat, or assessment data.",
  "Your family members (if you are in a family plan) see only what you explicitly share. Minors have extra protection by default.",
  "Your therapist sees only the information you have shared in sessions with them — plus what you explicitly opt into sharing via session handoff briefs.",
  "Nishma does not sell, rent, or share your personal data with advertisers or third-party data brokers. Ever.",
];

const RIGHTS = [
  {
    title: "Access",
    desc: "See everything we have stored about you from your Privacy page inside the app.",
  },
  {
    title: "Export",
    desc: "Download a full, structured export of your data in a machine-readable format.",
  },
  {
    title: "Delete",
    desc: "Permanently delete your account, chats, journals, assessments, or specific categories — with full audit logging.",
  },
  {
    title: "Correct",
    desc: "Update your profile, goals, emergency contact, or any other information at any time.",
  },
];

export default function SecurityPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[50vh] flex items-center bg-[#1a1832] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1832] via-[#1e1d3a] to-[#141830]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#80A8FF]/10 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-16 text-center w-full">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-primary-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <Shield className="w-4 h-4 mr-2" /> Privacy &amp; Security
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Your data stays
            <br />
            <span className="bg-gradient-to-r from-[#80A8FF] via-[#CEB5FF] to-[#8EC1DE] bg-clip-text text-transparent">
              yours.
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
            How we protect your wellness journey — honestly, technically, and in plain language.
          </p>
        </div>
      </section>

      {/* OUR APPROACH */}
      <section className="py-20 bg-gradient-to-b from-white to-[#f8f7ff] dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 font-bold mb-3 text-center">Our Approach</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-10">
            Privacy by design, not by afterthought
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 space-y-5 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              Mental wellness data is among the most sensitive information a person can share. We designed Nishma with that responsibility in mind from the first line of code.
            </p>
            <p>
              This page is deliberately honest. We will tell you exactly what we protect, how we protect it, what we are still building, and what you can do about any of it — without hiding behind certification logos we have not earned yet.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="py-20 bg-gradient-to-b from-[#f8f7ff] to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 font-bold mb-3 text-center">What We Already Protect</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-12">
            How your data is protected today
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROTECTIONS.map((p) => (
              <div key={p.title} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="w-11 h-11 gradient-bg rounded-xl flex items-center justify-center text-white shadow-md mb-4">
                  {p.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{p.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVACY PROMISES */}
      <section className="py-20 bg-gradient-to-b from-white to-[#f0f4ff] dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 font-bold mb-3 text-center">Our Promises</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-12">
            What we will never do
          </h2>
          <div className="space-y-4">
            {PRIVACY_PROMISES.map((promise, idx) => (
              <div key={idx} className="flex items-start space-x-4 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <CheckCircle className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{promise}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* YOUR RIGHTS */}
      <section className="py-20 bg-gradient-to-b from-[#f0f4ff] to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 font-bold mb-3 text-center">Your Rights</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-4">
            You are in control
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Aligned with GDPR (European Union) and the Digital Personal Data Protection Act (India).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {RIGHTS.map((r) => (
              <div key={r.title} className="flex items-start space-x-4 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-950 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{r.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP — HONEST */}
      <section className="py-20 bg-gradient-to-b from-white to-[#f8f7ff] dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-600 dark:text-accent-400 font-bold mb-3 text-center">Being Honest</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-4">
            What we are still building
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            We believe in transparency about our security roadmap — not just what exists today.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
            <div className="space-y-5">
              <div className="flex items-start space-x-4">
                <Clock className="w-6 h-6 text-accent-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">HIPAA BAA for US enterprise customers</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Coming with our first US enterprise pilot. Until then, we recommend US healthcare-adjacent customers wait for our HIPAA-ready tier rather than relying on the current product for regulated PHI workflows.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Clock className="w-6 h-6 text-accent-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">SOC 2 Type II certification</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">On our roadmap. We are following SOC 2 control principles today even before formal audit.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Clock className="w-6 h-6 text-accent-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Multi-factor authentication (MFA)</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Rolling out for admins first, then all users.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Clock className="w-6 h-6 text-accent-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Field-level encryption at rest for sensitive PHI</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Journal entries, AI chats, session notes — being migrated to dedicated encryption before our first enterprise production deployment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESPONSIBLE DISCLOSURE */}
      <section className="py-20 bg-gradient-to-b from-[#f8f7ff] to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start space-x-5">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-950 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 flex-shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Responsible Disclosure</h2>
                <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                  Found a security issue? We welcome reports from security researchers and users. Please contact our security team at the email below — we aim to acknowledge reports within 48 hours and will not take legal action against good-faith research.
                </p>
                <div className="mt-6 inline-flex items-center space-x-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Mail className="w-4 h-4 text-primary-500" />
                  <span className="font-mono text-sm text-gray-700 dark:text-gray-300">security@nishmawellness.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-white to-[#f0f4ff] dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="gradient-bg rounded-[2rem] p-14 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-extrabold">Have a security question?</h2>
            <p className="mt-4 text-lg text-white/80 max-w-lg mx-auto">
              We are happy to walk security teams through our architecture in detail.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link href="/request-demo" className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-colors flex items-center shadow-xl">
                Talk to Our Team <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/privacy" className="px-8 py-4 border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors">
                Read Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
