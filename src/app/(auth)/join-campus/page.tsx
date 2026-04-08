"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Leaf, CheckCircle, ArrowRight, Shield } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

export default function JoinCampusPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    setError("");

    if (!session) {
      router.push(`/student-signup?campusCode=${joinCode}`);
      return;
    }

    try {
      const res = await fetch("/api/company/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: joinCode.toUpperCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid code"); setLoading(false); return; }
      setSuccess(data.organization);
    } catch { setError("Something went wrong"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-secondary-50 to-white dark:from-gray-950 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <img src="/logo-square.png" alt="Nishma" className="w-9 h-9 rounded-xl" />
          <span className="text-xl font-bold gradient-text">Nishma Wellness</span>
        </div>

        {success ? (
          <Card className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome!</h2>
            <p className="text-gray-500 mb-6">You&apos;ve joined <strong>{success}</strong>&apos;s wellness program.</p>
            <Button onClick={() => router.push("/patient")} className="w-full rounded-2xl" size="lg">
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        ) : (
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-secondary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Join Your Campus</h2>
              <p className="text-gray-500 mt-2">Enter the code from your college/university</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

            <div className="space-y-4">
              <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g., A3F8KM2P"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-secondary-500 text-center font-mono text-xl tracking-widest uppercase"
                maxLength={8} />
              <Button onClick={handleJoin} loading={loading} className="w-full rounded-2xl" size="lg" disabled={joinCode.length < 4}>
                {session ? "Join Campus" : "Continue to Register"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="mt-4 flex items-center space-x-2 text-xs text-green-600">
              <Shield className="w-3 h-3" />
              <span>Your wellness data stays private. Campus only sees anonymized metrics.</span>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have a code? <Link href="/student-signup" className="text-secondary-600 hover:underline">Sign up individually</Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
