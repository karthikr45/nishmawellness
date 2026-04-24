"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, Send, CheckCircle, Clock } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import EmptyState from "@/components/ui/empty-state";
import { useToast } from "@/components/providers/toast-provider";

interface SentNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export default function AdminNotifications() {
  const { status } = useSession();
  const toast = useToast();
  const [form, setForm] = useState({ title: "", message: "", target: "ALL" });
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<SentNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/notifications")
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setHistory(data); })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status]);

  const sendNotification = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.warning("Title and message are required.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(`Notification sent to ${data.sent} user${data.sent !== 1 ? "s" : ""}`);
      setForm({ title: "", message: "", target: "ALL" });
      // Refresh history
      const histRes = await fetch("/api/admin/notifications");
      setHistory(await histRes.json());
    } catch {
      toast.error("Failed to send notification.");
    }
    setSending(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Send Notification</h1>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
            <select value={form.target} onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500">
              <option value="ALL">All Users</option>
              <option value="PATIENT">All Patients</option>
              <option value="THERAPIST">All Therapists</option>
            </select>
          </div>
          <Input label="Title" value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
            <textarea rows={4} value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <Button onClick={sendNotification} loading={sending} disabled={!form.title || !form.message}>
            <Send className="w-4 h-4 mr-2" /> Send Notification
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recently Sent</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            compact
            icon={<Bell className="w-10 h-10" />}
            title="No notifications sent yet"
            description="Compose your first system notification above to reach your users."
          />
        ) : (
          <div className="space-y-3">
            {history.map((n) => (
              <div key={n.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 dark:text-white">{n.title}</p>
                  <span className="text-xs text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1" />{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
