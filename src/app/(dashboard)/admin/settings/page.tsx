"use client";

import { useState } from "react";
import { Settings, Save, CheckCircle } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Nishma Wellness",
    supportEmail: "hello@nishmawellness.com",
    defaultSessionDuration: "60",
    aiChatEnabled: true,
    requireTherapistApproval: true,
    maxSessionsPerDay: "8",
  });

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>

      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" /> Settings saved successfully!
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
              <input type="checkbox" checked={settings.aiChatEnabled}
                onChange={(e) => setSettings((p) => ({ ...p, aiChatEnabled: e.target.checked }))}
                className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm text-gray-700">Enable AI Chat for patients</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" checked={settings.requireTherapistApproval}
                onChange={(e) => setSettings((p) => ({ ...p, requireTherapistApproval: e.target.checked }))}
                className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm text-gray-700">Require admin approval for new therapists</span>
            </label>
          </div>

          <Button onClick={save}><Save className="w-4 h-4 mr-2" /> Save Settings</Button>
        </div>
      </Card>
    </div>
  );
}
