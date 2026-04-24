"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Settings, Save } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useToast } from "@/components/providers/toast-provider";

const DEFAULT_SETTINGS: Record<string, string> = {
  siteName: "Nishma Wellness",
  supportEmail: "hello@nishmawellness.com",
  defaultSessionDuration: "60",
  maxSessionsPerDay: "8",
  aiChatEnabled: "true",
  requireTherapistApproval: "true",
};

export default function AdminSettings() {
  const { status } = useSession();
  const toast = useToast();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/settings")
        .then((r) => r.json())
        .then((data) => {
          if (data && typeof data === "object" && !data.error) {
            setSettings((prev) => ({ ...prev, ...data }));
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved");
    } catch {
      toast.error("Could not save settings.");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Settings</h1>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" /> General Settings
        </h2>
        <div className="space-y-4">
          <Input label="Site Name" value={settings.siteName}
            onChange={(e) => setSettings((p) => ({ ...p, siteName: e.target.value }))} />
          <Input label="Support Email" type="email" value={settings.supportEmail}
            onChange={(e) => setSettings((p) => ({ ...p, supportEmail: e.target.value }))} />
          <Input label="Default Session Duration (min)" type="number" value={settings.defaultSessionDuration}
            onChange={(e) => setSettings((p) => ({ ...p, defaultSessionDuration: e.target.value }))} />
          <Input label="Max Sessions Per Day" type="number" value={settings.maxSessionsPerDay}
            onChange={(e) => setSettings((p) => ({ ...p, maxSessionsPerDay: e.target.value }))} />

          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input type="checkbox" checked={settings.aiChatEnabled === "true"}
                onChange={(e) => setSettings((p) => ({ ...p, aiChatEnabled: String(e.target.checked) }))}
                className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable AI Chat for patients</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" checked={settings.requireTherapistApproval === "true"}
                onChange={(e) => setSettings((p) => ({ ...p, requireTherapistApproval: String(e.target.checked) }))}
                className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Require admin approval for new therapists</span>
            </label>
          </div>

          <Button onClick={save} loading={saving}><Save className="w-4 h-4 mr-2" /> Save Settings</Button>
        </div>
      </Card>
    </div>
  );
}
