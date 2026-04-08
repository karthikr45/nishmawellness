"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // In production, call API to send reset email
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <img src="/logo-square.png" alt="Nishma" className="w-14 h-14 rounded-xl" />
          <span className="text-xl font-bold gradient-text">Nishma Wellness</span>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-500 mb-6">
                If an account exists with <strong>{email}</strong>, we&apos;ve sent password reset instructions.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Didn&apos;t receive an email? Check your spam folder or try again.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Forgot Password</h2>
              <p className="text-gray-500 mb-6">
                Enter your email and we&apos;ll send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="email" type="email" label="Email address"
                  placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required
                />
                <Button type="submit" loading={loading} className="w-full" size="lg">
                  <Mail className="w-4 h-4 mr-2" /> Send Reset Link
                </Button>
              </form>

              <Link href="/login" className="flex items-center justify-center mt-6 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
