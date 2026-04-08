"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, Eye, EyeOff, ArrowRight, UserCircle, Stethoscope } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "therapist" ? "THERAPIST" : "PATIENT";

  const [role, setRole] = useState(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    licenseNumber: "",
    experience: "",
    bio: "",
  });

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccess(data.message + " Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white animate-float" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-white animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf className="w-7 h-7" />
            </div>
            <span className="text-3xl font-bold">Nishma Wellness</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Start Your Journey</h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Join thousands who have transformed their well-being with Nishma Wellness.
            Get access to expert therapists, AI support, and holistic programs.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center space-x-2 mb-8">
            <img src="/logo.png" alt="Nishma Wellness" className="h-14 max-w-[200px] object-contain" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
          <p className="text-gray-500 mb-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>

          {/* Role selection */}
          <div className="flex space-x-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("PATIENT")}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all ${
                role === "PATIENT"
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <UserCircle className="w-5 h-5" />
              <span className="font-medium text-sm">Patient</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("THERAPIST")}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all ${
                role === "THERAPIST"
                  ? "border-secondary-600 bg-secondary-50 text-secondary-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              <span className="font-medium text-sm">Therapist</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Full Name"
              placeholder={role === "THERAPIST" ? "Dr. Jane Smith" : "Jane Smith"}
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              required
            />
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
              required
            />
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => updateForm("password", e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <Input
              id="phone"
              type="tel"
              label="Phone (optional)"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={(e) => updateForm("phone", e.target.value)}
            />

            {role === "THERAPIST" && (
              <>
                <Input
                  id="specialization"
                  label="Specialization"
                  placeholder="e.g., CBT, Family Therapy, Psychiatry"
                  value={form.specialization}
                  onChange={(e) => updateForm("specialization", e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id="licenseNumber"
                    label="License Number"
                    placeholder="PSY-XXXX"
                    value={form.licenseNumber}
                    onChange={(e) => updateForm("licenseNumber", e.target.value)}
                    required
                  />
                  <Input
                    id="experience"
                    type="number"
                    label="Years of Experience"
                    placeholder="e.g., 5"
                    value={form.experience}
                    onChange={(e) => updateForm("experience", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    placeholder="Tell patients about your approach and expertise..."
                    value={form.bio}
                    onChange={(e) => updateForm("bio", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>
              </>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {role === "THERAPIST" && (
            <p className="mt-4 text-xs text-gray-500 text-center">
              Therapist accounts require admin verification before activation.
            </p>
          )}

          <div className="mt-6 space-y-3">
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <p className="text-sm text-gray-600">
                Have a company join code?{" "}
                <Link href="/join-company" className="text-blue-600 font-medium hover:underline">
                  Join your company
                </Link>
              </p>
            </div>
            <div className="p-4 bg-secondary-50 rounded-xl text-center">
              <p className="text-sm text-gray-600">
                Setting up for your organization?{" "}
                <Link href="/company-signup" className="text-secondary-600 font-medium hover:underline">
                  Company Registration
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
