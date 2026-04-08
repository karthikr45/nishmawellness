"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Building2, ArrowRight, CheckCircle, Leaf, Shield,
  Users, BarChart3, BookOpen, Brain,
} from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";

export default function CorporateOnboarding() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    companyDomain: "",
    department: "",
    employeeId: "",
    referralCode: "",
    goals: [] as string[],
    privacyAcknowledged: false,
  });

  const CORP_GOALS = [
    { id: "stress", label: "Workplace Stress Management", icon: <Shield className="w-5 h-5" /> },
    { id: "burnout", label: "Burnout Prevention", icon: <Brain className="w-5 h-5" /> },
    { id: "leadership", label: "Leadership Wellness", icon: <Users className="w-5 h-5" /> },
    { id: "team", label: "Team Dynamics", icon: <Users className="w-5 h-5" /> },
    { id: "balance", label: "Work-Life Balance", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "resilience", label: "Building Resilience", icon: <BookOpen className="w-5 h-5" /> },
  ];

  const toggleGoal = (id: string) => {
    setForm((p) => ({
      ...p,
      goals: p.goals.includes(id) ? p.goals.filter((g) => g !== id) : [...p.goals, id],
    }));
  };

  const submit = async () => {
    setSaving(true);
    try {
      // Try to find matching organization by domain
      // Complete the standard onboarding after
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryGoals: form.goals,
          responses: {
            type: "CORPORATE",
            companyName: form.companyName,
            companyDomain: form.companyDomain,
            department: form.department,
            employeeId: form.employeeId,
            referralCode: form.referralCode,
          },
          therapyHistory: "NEVER",
          preferredStyle: "UNSURE",
          concerns: [],
        }),
      });
      setStep(3);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <img src="/logo-square.png" alt="Nishma" className="w-12 h-12 rounded-xl" />
          <span className="text-lg font-bold gradient-text">Nishma Wellness</span>
          <span className="text-gray-400 mx-2">|</span>
          <Building2 className="w-5 h-5 text-secondary-600" />
          <span className="font-medium text-gray-700">Corporate Wellness</span>
        </div>

        <Card className="p-8">
          {/* Step 0: Company Verification */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-secondary-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Corporate Wellness Setup</h1>
                <p className="text-gray-500 mt-2">Welcome, {session?.user?.name}! Let&apos;s connect you to your organization&apos;s wellness program.</p>
              </div>

              <Input label="Company Name" value={form.companyName}
                onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
                placeholder="e.g., Acme Corporation" />

              <Input label="Company Email Domain" value={form.companyDomain}
                onChange={(e) => setForm((p) => ({ ...p, companyDomain: e.target.value }))}
                placeholder="e.g., acme.com" />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Department" value={form.department}
                  onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                  placeholder="e.g., Engineering" />
                <Input label="Employee ID (optional)" value={form.employeeId}
                  onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
                  placeholder="e.g., EMP-12345" />
              </div>

              <Input label="Referral / Access Code (if provided)" value={form.referralCode}
                onChange={(e) => setForm((p) => ({ ...p, referralCode: e.target.value }))}
                placeholder="Enter code from HR" />

              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Your Privacy is Protected</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Your employer will only see anonymized, aggregate wellness data.
                      Individual session details, journal entries, and chat history are never shared.
                    </p>
                  </div>
                </div>
              </div>

              <label className="flex items-start space-x-3">
                <input type="checkbox" checked={form.privacyAcknowledged}
                  onChange={(e) => setForm((p) => ({ ...p, privacyAcknowledged: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded mt-1" />
                <span className="text-sm text-gray-600">
                  I understand that my individual wellness data remains private and only anonymized
                  statistics are shared with my organization.
                </span>
              </label>
            </div>
          )}

          {/* Step 1: Corporate Goals */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">What are your wellness goals?</h2>
              <p className="text-gray-500 mb-6">Select the areas you&apos;d like to focus on through your corporate wellness program.</p>
              <div className="grid grid-cols-2 gap-3">
                {CORP_GOALS.map((goal) => (
                  <button key={goal.id} onClick={() => toggleGoal(goal.id)}
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 text-left transition-all ${
                      form.goals.includes(goal.id)
                        ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>
                    <span className={form.goals.includes(goal.id) ? "text-secondary-600" : "text-gray-400"}>{goal.icon}</span>
                    <span className="text-sm font-medium">{goal.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Benefits Overview */}
          {step === 2 && (
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Corporate Benefits</h2>
              <div className="grid grid-cols-2 gap-4 text-left mb-6">
                {[
                  { icon: <Brain className="w-6 h-6 text-purple-600" />, title: "AI Wellness Chat", desc: "24/7 AI support between sessions", bg: "bg-purple-50" },
                  { icon: <Users className="w-6 h-6 text-blue-600" />, title: "Therapy Sessions", desc: "Covered by your employer", bg: "bg-blue-50" },
                  { icon: <BookOpen className="w-6 h-6 text-green-600" />, title: "Wellness Programs", desc: "Full access to all programs", bg: "bg-green-50" },
                  { icon: <Shield className="w-6 h-6 text-orange-600" />, title: "100% Confidential", desc: "Your data stays private", bg: "bg-orange-50" },
                ].map((benefit) => (
                  <div key={benefit.title} className={`p-4 ${benefit.bg} rounded-xl`}>
                    {benefit.icon}
                    <p className="font-medium text-gray-900 mt-2 text-sm">{benefit.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{benefit.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Your organization provides these benefits as part of their employee wellness program.
              </p>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <div className="text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Nishma!</h2>
              <p className="text-gray-600 mb-6">
                Your corporate wellness account is set up. You now have access to therapy sessions,
                wellness programs, and AI support — all covered by your employer.
              </p>
              <Button onClick={() => router.push("/onboarding")} size="lg" className="w-full">
                Continue to Personal Setup <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <button onClick={() => router.push("/patient")} className="text-sm text-gray-500 hover:text-gray-700 mt-4 block mx-auto">
                Skip personal setup for now
              </button>
            </div>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>Back</Button>
              ) : <div />}
              {step < 2 ? (
                <Button onClick={() => setStep((s) => s + 1)}
                  disabled={step === 0 && (!form.companyName || !form.privacyAcknowledged)}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={submit} loading={saving}>
                  Complete Setup <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
