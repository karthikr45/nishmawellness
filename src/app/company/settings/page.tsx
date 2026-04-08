"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Settings, Copy, CheckCircle, Shield } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function CompanySettingsPage() {
  const { status } = useSession();
  const [org, setOrg] = useState<{ id: string; name: string; joinCode: string; domain?: string; maxEmployees: number; sessionsPerEmployee: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/company").then((r) => r.json()).then((data) => {
        const o = Array.isArray(data) ? data[0] : (data?.organization || data);
        if (o?.id) setOrg(o);
      });
    }
  }, [status]);

  const copyCode = () => {
    if (org?.joinCode) { navigator.clipboard.writeText(org.joinCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Settings</h1>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-primary-600" /> Join Code
        </h2>
        <div className="flex items-center space-x-3">
          <code className="px-6 py-3 bg-primary-50 rounded-xl font-mono text-xl font-bold text-primary-600 tracking-widest flex-1 text-center">
            {org?.joinCode || "—"}
          </code>
          <Button variant="outline" onClick={copyCode}>
            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Share this code with employees so they can self-register.</p>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Details</h2>
        <div className="space-y-4">
          <Input label="Company Name" value={org?.name || ""} disabled />
          <Input label="Email Domain" value={org?.domain || ""} disabled placeholder="Not set" />
          <Input label="Max Employees" value={String(org?.maxEmployees || 100)} disabled />
          <Input label="Sessions per Employee/Year" value={String(org?.sessionsPerEmployee || 12)} disabled />
        </div>
      </Card>
    </div>
  );
}
