"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2, CheckCircle, Clock, Shield, ArrowRight, Mail, Calendar, Loader2,
} from "lucide-react";

const EMPLOYEE_RANGES = [
  "1-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1,000 employees",
  "1,001-5,000 employees",
  "5,000+ employees",
];

const ROLES = [
  "HR Director / VP of People",
  "Chief Human Resources Officer (CHRO)",
  "People Operations Manager",
  "Benefits / Wellness Manager",
  "CEO / Founder",
  "CFO / Finance",
  "Other Leadership",
];

const AGENDA = [
  "Walk through the product — patient, therapist, and HR admin views",
  "Discuss how burnout prediction and wellness analytics work for your team",
  "Review pricing, implementation timeline, and pilot options",
  "Answer your privacy, compliance, and integration questions",
];

export default function RequestDemoPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    employees: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unable to submit. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <section className="min-h-[80vh] flex items-center bg-gradient-to-b from-white to-[#f0f4ff] dark:from-gray-950 dark:to-gray-900 pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-20 h-20 gradient-bg rounded-3xl flex items-center justify-center text-white shadow-xl mx-auto mb-8">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Thanks, {form.name.split(" ")[0] || "there"}!
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
            We received your request and will reach out within <strong className="text-gray-700 dark:text-gray-300">one business day</strong> to schedule your demo.
          </p>
          <div className="mt-10 inline-flex items-center space-x-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <Mail className="w-4 h-4 text-primary-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Confirmation sent to {form.email}</span>
          </div>
          <div className="mt-10">
            <Link href="/" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline inline-flex items-center">
              Back to home <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[40vh] flex items-center bg-[#1a1832] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1832] via-[#1e1d3a] to-[#141830]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#80A8FF]/10 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-16 text-center w-full">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-primary-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <Building2 className="w-4 h-4 mr-2" /> For Teams &amp; Companies
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            See Nishma in
            <br />
            <span className="bg-gradient-to-r from-[#80A8FF] via-[#CEB5FF] to-[#8EC1DE] bg-clip-text text-transparent">
              your context.
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
            Book a 30-minute demo. See how Nishma fits your employees, your budget, and your compliance needs.
          </p>
        </div>
      </section>

      {/* FORM + SIDEBAR */}
      <section className="py-20 bg-gradient-to-b from-white to-[#f8f7ff] dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                  Tell us about your team
                </h2>
                <p className="mt-3 text-gray-500">
                  We will be in touch within one business day.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Work Email *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="jane@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Company *</label>
                    <input
                      required
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Acme Corp"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Role *</label>
                      <select
                        required
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select role...</option>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Team Size *</label>
                      <select
                        required
                        value={form.employees}
                        onChange={(e) => setForm({ ...form, employees: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select size...</option>
                        {EMPLOYEE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">What are you hoping to solve?</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Burnout, turnover, mental health benefits gap, compliance, pilot program..."
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full py-4 gradient-bg text-white font-bold text-base rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {status === "submitting" ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...</>
                    ) : (
                      <>Request Demo <ArrowRight className="w-5 h-5 ml-2" /></>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    By submitting, you agree to our <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link> and <Link href="/terms" className="text-primary-600 hover:underline">Terms</Link>.
                  </p>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-7 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white"><Calendar className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">What to expect</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">A 30-minute conversation tailored to your organisation:</p>
                <ul className="space-y-3">
                  {AGENDA.map((item) => (
                    <li key={item} className="flex items-start space-x-2.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl p-7 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-950 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400"><Clock className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Response time</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">We respond to all demo requests within <strong>one business day</strong>.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl p-7 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-950 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400"><Shield className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your info</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Used only to contact you about the demo. Never shared or sold. <Link href="/privacy" className="text-primary-600 hover:underline">Privacy policy</Link>.</p>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 rounded-3xl p-7 border border-primary-100 dark:border-primary-900">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Not ready for a demo?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Start with the free tier and invite colleagues directly.</p>
                <Link href="/register" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center">
                  Try it free <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
