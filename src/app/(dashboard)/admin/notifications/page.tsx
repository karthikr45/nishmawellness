"use client";

import { useState } from "react";
import { Bell, Send, CheckCircle } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function AdminNotifications() {
  const [form, setForm] = useState({ title: "", message: "", target: "ALL" });
  const [sent, setSent] = useState(false);

  const sendNotification = () => {
    setSent(true);
    setForm({ title: "", message: "", target: "ALL" });
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Send Notification</h1>

      {sent && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" /> Notification sent successfully!
        </div>
      )}

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <select value={form.target} onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
              <option value="ALL">All Users</option>
              <option value="PATIENT">All Patients</option>
              <option value="THERAPIST">All Therapists</option>
            </select>
          </div>
          <Input label="Title" value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea rows={4} value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
          </div>
          <Button onClick={sendNotification} disabled={!form.title || !form.message}>
            <Send className="w-4 h-4 mr-2" /> Send Notification
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications Sent</h2>
        <div className="space-y-3">
          {[
            { title: "System Maintenance", message: "Platform will be under maintenance on Sunday 2-4 AM EST.", target: "ALL", date: "2024-03-28" },
            { title: "New Program Available", message: "Check out our new Stress Management Toolkit program!", target: "PATIENT", date: "2024-03-25" },
          ].map((n, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{n.title}</p>
                <span className="text-xs text-gray-400">{n.date}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{n.message}</p>
              <span className="text-xs text-primary-600 mt-2 inline-block">Sent to: {n.target}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
