"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  GraduationCap, Leaf, ArrowRight, ArrowLeft, CheckCircle,
  Eye, EyeOff, BookOpen, Brain, Heart,
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";

export default function StudentSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    institution: "", year: "", stream: "", campusCode: "",
    stressAreas: [] as string[],
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const toggleStress = (area: string) => {
    setForm((p) => ({
      ...p,
      stressAreas: p.stressAreas.includes(area) ? p.stressAreas.filter((a) => a !== area) : [...p.stressAreas, area],
    }));
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }

    try {
      // Register user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, name: form.name, phone: form.phone, role: "PATIENT" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }

      // Auto-login
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });

      // Save student info as onboarding
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: { type: "STUDENT", institution: form.institution, year: form.year, stream: form.stream },
          primaryGoals: form.stressAreas,
          therapyHistory: "NEVER",
          preferredStyle: "UNSURE",
          concerns: [],
        }),
      });

      // Join campus if code provided
      if (form.campusCode) {
        await fetch("/api/company/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ joinCode: form.campusCode.toUpperCase() }),
        }).catch(() => {});
      }

      setStep(3);
    } catch { setError("Something went wrong"); }
    setLoading(false);
  };

  const STRESS_AREAS = [
    { id: "exams", label: "Exam Pressure", emoji: "📝" },
    { id: "career", label: "Career Confusion", emoji: "🔮" },
    { id: "grades", label: "Grade Anxiety", emoji: "📊" },
    { id: "peers", label: "Peer Pressure", emoji: "👥" },
    { id: "family", label: "Family Expectations", emoji: "👨‍👩‍👧" },
    { id: "financial", label: "Financial Stress", emoji: "💰" },
    { id: "loneliness", label: "Loneliness", emoji: "😔" },
    { id: "placement", label: "Placement Anxiety", emoji: "💼" },
    { id: "comparison", label: "Comparison", emoji: "⚖️" },
    { id: "burnout", label: "Academic Burnout", emoji: "🔥" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary-600 to-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white animate-float" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center space-x-3 mb-8">
            <GraduationCap className="w-10 h-10" />
            <div>
              <span className="text-3xl font-bold">Nishma for Students</span>
              <p className="text-white/70 text-sm">Your wellness companion through academia</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-6">Built for Your Student Life.</h1>
          <div className="space-y-4">
            {[
              { icon: <Brain className="w-5 h-5" />, text: "AI that understands exam stress & career anxiety" },
              { icon: <BookOpen className="w-5 h-5" />, text: "Study tools: focus timer, techniques, wellness plans" },
              { icon: <Heart className="w-5 h-5" />, text: "Career exploration & interview prep support" },
              { icon: <GraduationCap className="w-5 h-5" />, text: "Starts at ₹149/month — or free with campus plan" },
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">{item.icon}</div>
                <span className="text-white/90">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center space-x-2 mb-8">
            <img src="/logo-square.png" alt="Nishma" className="w-9 h-9 rounded-xl" />
            <span className="text-xl font-bold gradient-text">Nishma for Students</span>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            {["About You", "Your Studies", "Your Stress", "Done"].map((label, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < step ? "bg-primary-600 text-white" : i === step ? "bg-primary-100 text-primary-700 border-2 border-primary-500" : "bg-gray-100 text-gray-400"
                }`}>{i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}</div>
                {i < 3 && <div className={`w-6 h-0.5 ${i < step ? "bg-primary-500" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

          {/* Step 0: Account */}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
              <p className="text-gray-500 mb-6">Free to start. No credit card needed.</p>
              <div className="space-y-4">
                <Input label="Full Name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g., Priya Sharma" required />
                <Input label="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@college.edu" required />
                <div className="relative">
                  <Input label="Password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Min 6 characters" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Studies */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">About Your Studies</h2>
              <p className="text-gray-500 mb-6">Helps us personalize your experience</p>
              <div className="space-y-4">
                <Input label="College / University" value={form.institution} onChange={(e) => update("institution", e.target.value)} placeholder="e.g., IIT Delhi, Delhi University" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select value={form.year} onChange={(e) => update("year", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                      <option value="">Select</option>
                      <option value="1">1st Year</option><option value="2">2nd Year</option>
                      <option value="3">3rd Year</option><option value="4">4th Year</option>
                      <option value="pg">Postgraduate</option><option value="phd">PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
                    <select value={form.stream} onChange={(e) => update("stream", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                      <option value="">Select</option>
                      <option value="engineering">Engineering</option><option value="medical">Medical</option>
                      <option value="commerce">Commerce</option><option value="arts">Arts / Humanities</option>
                      <option value="science">Science</option><option value="law">Law</option>
                      <option value="management">Management / MBA</option><option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <Input label="Campus Code (if your college has Nishma)" value={form.campusCode}
                  onChange={(e) => update("campusCode", e.target.value.toUpperCase())} placeholder="e.g., A3F8KM2P (optional)" />
              </div>
            </div>
          )}

          {/* Step 2: Stress Areas */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What Stresses You?</h2>
              <p className="text-gray-500 mb-6">Select all that apply — helps our AI support you better</p>
              <div className="grid grid-cols-2 gap-3">
                {STRESS_AREAS.map((area) => (
                  <button key={area.id} onClick={() => toggleStress(area.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      form.stressAreas.includes(area.id)
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>
                    <span className="text-lg mr-2">{area.emoji}</span>
                    <span className="text-sm font-medium">{area.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Nishma!</h2>
              <p className="text-gray-500 mb-6">Your student wellness dashboard is ready.</p>
              <div className="space-y-3">
                <Button onClick={() => router.push("/patient")} size="lg" className="w-full rounded-2xl">
                  Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button onClick={() => router.push("/patient/career")} variant="outline" size="lg" className="w-full rounded-2xl">
                  Take Career Assessment <GraduationCap className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              ) : (
                <Link href="/register" className="text-sm text-gray-500">Regular signup</Link>
              )}
              {step < 2 ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 ? !form.name || !form.email || !form.password : false}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={submit} loading={loading}>Create Account <CheckCircle className="w-4 h-4 ml-2" /></Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
