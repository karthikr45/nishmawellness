"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  Building2, Leaf, ArrowRight, ArrowLeft, CheckCircle,
  Shield, Users, BarChart3, Brain, Eye, EyeOff,
  Copy, Sparkles,
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";

export default function CompanySignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    // Company
    companyName: "",
    industry: "IT",
    size: "MEDIUM",
    country: "IN",
    currency: "INR",
    domain: "",
    maxEmployees: "100",
    // Admin
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminPhone: "",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const submit = async () => {
    setLoading(true);
    setError("");

    if (form.adminPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/company/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setJoinCode(data.company.joinCode);
      setStep(3); // Success step

      // Auto-login the admin
      await signIn("credentials", {
        email: form.adminEmail,
        password: form.adminPassword,
        redirect: false,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white animate-float" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-white animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-3xl font-bold">Nishma Wellness</span>
              <p className="text-white/70 text-sm">Corporate Wellness Platform</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-6">Empower Your Team&apos;s Well-being</h1>

          <div className="space-y-4">
            {[
              { icon: <Brain className="w-5 h-5" />, text: "AI-powered 24/7 wellness support for every employee" },
              { icon: <Shield className="w-5 h-5" />, text: "100% anonymized data — individual privacy guaranteed" },
              { icon: <BarChart3 className="w-5 h-5" />, text: "Real-time analytics and ROI tracking for HR" },
              { icon: <Users className="w-5 h-5" />, text: "Scales from 10 to 10,000+ employees" },
              { icon: <Sparkles className="w-5 h-5" />, text: "TwinClone AI — your therapist, available 24/7" },
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">{item.icon}</div>
                <span className="text-white/90">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-4 bg-white/10 rounded-xl">
            <p className="text-sm text-white/80">Trusted by companies across Banking, IT, Healthcare, Manufacturing, and more.</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="lg:hidden flex items-center space-x-2 mb-8">
            <img src="/logo-square.png" alt="Nishma" className="w-12 h-12 rounded-xl" />
            <span className="text-xl font-bold gradient-text">Nishma Wellness</span>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            {["Company", "Admin Account", "Review", "Done"].map((label, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < step ? "bg-primary-600 text-white" :
                  i === step ? "bg-primary-100 text-primary-700 border-2 border-primary-500" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < 3 && <div className={`w-8 h-0.5 ${i < step ? "bg-primary-500" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          {/* Step 0: Company Details */}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Up Your Company</h2>
              <p className="text-gray-500 mb-6">Tell us about your organization</p>

              <div className="space-y-4">
                <Input label="Company Name" value={form.companyName} onChange={(e) => update("companyName", e.target.value)}
                  placeholder="e.g., Infosys, HDFC Bank, Apollo Hospitals" required />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select value={form.industry} onChange={(e) => update("industry", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                      <option value="IT">IT / Software</option>
                      <option value="BANKING">Banking / Finance</option>
                      <option value="HEALTHCARE">Healthcare</option>
                      <option value="MANUFACTURING">Manufacturing</option>
                      <option value="RETAIL">Retail</option>
                      <option value="EDUCATION">Education</option>
                      <option value="BPO">BPO / Services</option>
                      <option value="GOVERNMENT">Government</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                    <select value={form.size} onChange={(e) => update("size", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                      <option value="STARTUP">Startup (1-50)</option>
                      <option value="SMALL">Small (51-200)</option>
                      <option value="MEDIUM">Medium (201-1000)</option>
                      <option value="LARGE">Large (1001-5000)</option>
                      <option value="ENTERPRISE">Enterprise (5000+)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select value={form.country} onChange={(e) => { update("country", e.target.value); update("currency", e.target.value === "IN" ? "INR" : "USD"); }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="SG">Singapore</option>
                      <option value="AE">UAE</option>
                    </select>
                  </div>
                  <Input label="Email Domain (optional)" value={form.domain} onChange={(e) => update("domain", e.target.value)}
                    placeholder="e.g., company.com" />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Admin Account */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Admin Account</h2>
              <p className="text-gray-500 mb-6">This will be the company administrator who manages the wellness program</p>

              <div className="space-y-4">
                <Input label="Full Name" value={form.adminName} onChange={(e) => update("adminName", e.target.value)}
                  placeholder="e.g., Rajesh Kumar" required />
                <Input label="Work Email" type="email" value={form.adminEmail} onChange={(e) => update("adminEmail", e.target.value)}
                  placeholder="admin@company.com" required />
                <div className="relative">
                  <Input label="Password" type={showPassword ? "text" : "password"} value={form.adminPassword}
                    onChange={(e) => update("adminPassword", e.target.value)} placeholder="Min 6 characters" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <Input label="Phone (optional)" type="tel" value={form.adminPhone} onChange={(e) => update("adminPhone", e.target.value)}
                  placeholder="+91 98765 43210" />
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
              <p className="text-gray-500 mb-6">Verify your details before creating the company</p>

              <div className="space-y-4">
                <Card className="p-4">
                  <p className="text-xs text-gray-400 uppercase font-medium mb-2">Company</p>
                  <p className="font-semibold text-gray-900">{form.companyName}</p>
                  <p className="text-sm text-gray-500">{form.industry} &middot; {form.size} &middot; {form.country}</p>
                  {form.domain && <p className="text-sm text-gray-500">Domain: @{form.domain}</p>}
                </Card>

                <Card className="p-4">
                  <p className="text-xs text-gray-400 uppercase font-medium mb-2">Admin Account</p>
                  <p className="font-semibold text-gray-900">{form.adminName}</p>
                  <p className="text-sm text-gray-500">{form.adminEmail}</p>
                  {form.adminPhone && <p className="text-sm text-gray-500">{form.adminPhone}</p>}
                </Card>

                <div className="p-4 bg-green-50 rounded-xl flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Privacy Guaranteed</p>
                    <p className="text-xs text-green-600 mt-1">
                      Individual employee wellness data is always anonymized.
                      You&apos;ll only see aggregate metrics. HIPAA compliant.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-700">
                    <strong>What happens next:</strong> Your company portal will be created instantly.
                    You&apos;ll get a join code to share with employees. They can start using the
                    wellness platform immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{form.companyName} is Ready!</h2>
              <p className="text-gray-500 mb-6">Your company wellness portal has been created.</p>

              <Card className="p-6 mb-6">
                <p className="text-sm text-gray-500 mb-2">Share this code with your employees:</p>
                <div className="flex items-center justify-center space-x-3">
                  <code className="px-6 py-3 bg-primary-50 rounded-xl font-mono text-2xl font-bold text-primary-600 tracking-widest">
                    {joinCode}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyCode}>
                    {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Employees enter this code at registration to join your organization.
                </p>
              </Card>

              <div className="space-y-3">
                <Button onClick={() => router.push("/company")} size="lg" className="w-full">
                  <Building2 className="w-5 h-5 mr-2" /> Go to Company Dashboard
                </Button>
                <p className="text-xs text-gray-400">
                  Logged in as {form.adminEmail}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : (
                <Link href="/register" className="text-sm text-gray-500 hover:text-gray-700">
                  Individual signup instead
                </Link>
              )}
              {step < 2 ? (
                <Button onClick={() => setStep((s) => s + 1)}
                  disabled={step === 0 ? !form.companyName : !form.adminEmail || !form.adminPassword || !form.adminName}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={submit} loading={loading}>
                  Create Company <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}

          {step === 0 && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account? <Link href="/login" className="text-primary-600 hover:underline">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
