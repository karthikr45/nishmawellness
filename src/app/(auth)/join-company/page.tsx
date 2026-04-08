"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Leaf, CheckCircle, ArrowRight, Shield, Users } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";

export default function JoinCompanyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ companyName: string } | null>(null);

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    setError("");

    if (!session) {
      // Not logged in — redirect to register with join code
      router.push(`/register?joinCode=${joinCode}`);
      return;
    }

    try {
      const res = await fetch("/api/company/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: joinCode.toUpperCase().trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not join company");
        setLoading(false);
        return;
      }

      setSuccess({ companyName: data.organization });
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <img src="/logo.png" alt="Nishma Wellness" className="h-14 max-w-[200px] object-contain" />
        </div>

        {success ? (
          <Card className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
            <p className="text-gray-500 mb-6">
              You&apos;ve joined <strong>{success.companyName}</strong>&apos;s wellness program.
            </p>
            <div className="space-y-3">
              <Button onClick={() => router.push("/onboarding")} className="w-full" size="lg">
                Complete Wellness Setup <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button onClick={() => router.push("/patient")} className="text-sm text-gray-500 hover:text-gray-700">
                Skip for now
              </button>
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Join Your Company</h2>
              <p className="text-gray-500 mt-2">
                Enter the code provided by your HR or company admin
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Join Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g., A3F8KM2P"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-center font-mono text-xl tracking-widest uppercase"
                  maxLength={8}
                />
              </div>

              <Button onClick={handleJoin} loading={loading} className="w-full" size="lg" disabled={joinCode.length < 4}>
                {session ? "Join Company" : "Continue to Register"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl space-y-2">
              <p className="text-xs font-medium text-gray-500">How it works:</p>
              <div className="flex items-start space-x-2 text-xs text-gray-400">
                <span className="bg-primary-100 text-primary-700 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">1</span>
                <span>{session ? "Enter code to join" : "Create your account"}</span>
              </div>
              <div className="flex items-start space-x-2 text-xs text-gray-400">
                <span className="bg-primary-100 text-primary-700 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">2</span>
                <span>Complete a quick wellness assessment</span>
              </div>
              <div className="flex items-start space-x-2 text-xs text-gray-400">
                <span className="bg-primary-100 text-primary-700 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">3</span>
                <span>Start using therapy, AI chat, exercises — all covered by your employer</span>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2 text-xs text-green-600">
              <Shield className="w-3 h-3" />
              <span>Your individual wellness data stays private. Only anonymized metrics are shared.</span>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              {session ? (
                <Link href="/patient" className="text-primary-600 hover:underline">Go to dashboard instead</Link>
              ) : (
                <>
                  Don&apos;t have a code? <Link href="/register" className="text-primary-600 hover:underline">Sign up individually</Link>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
