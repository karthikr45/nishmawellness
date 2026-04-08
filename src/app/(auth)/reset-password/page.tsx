"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Eye, EyeOff, CheckCircle, Lock } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setDone(true);
    setLoading(false);
    setTimeout(() => router.push("/login"), 2000);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h2>
          <p className="text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <img src="/logo-square.png" alt="Nishma" className="w-12 h-12 rounded-xl" />
          <span className="text-xl font-bold gradient-text">Nishma Wellness</span>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Set New Password</h2>
          <p className="text-gray-500 mb-6">Enter your new password below.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} label="New Password"
                placeholder="Min 6 characters" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <Input id="confirmPassword" type="password" label="Confirm Password"
              placeholder="Confirm your password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} required />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              <Lock className="w-4 h-4 mr-2" /> Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
