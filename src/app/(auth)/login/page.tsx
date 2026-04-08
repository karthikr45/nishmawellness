"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, Eye, EyeOff, ArrowRight } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // Fetch session to get role (org role is baked into session at login)
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const role = session?.user?.role;

      // Check if user needs onboarding
      const profileRes = await fetch("/api/users/profile");
      const profile = await profileRes.json();

      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (role === "ORG_ADMIN") {
        router.push("/company");
      } else if (role === "HR_MANAGER") {
        router.push("/hr");
      } else if (role === "THERAPIST") {
        router.push("/therapist");
      } else if (role === "ADMIN") {
        router.push("/admin");
      } else if (!profile.onboardingDone) {
        router.push("/onboarding");
      } else {
        router.push("/patient");
      }
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
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Continue your wellness journey. Access your personalized dashboard,
            connect with therapists, and track your progress.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">1</div>
              <span>Access AI-powered wellness support 24/7</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">2</div>
              <span>Book sessions with licensed therapists</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">3</div>
              <span>Join transformative wellness programs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Nishma Wellness</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
          <p className="text-gray-500 mb-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary-600 font-medium hover:underline">
              Get started
            </Link>
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="text-right mt-2">
              <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 font-medium mb-2">Demo Accounts:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Patient: patient@example.com / password123</p>
              <p>Therapist: dr.sarah@nishmawellness.com / password123</p>
              <p>Admin: admin@nishmawellness.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
