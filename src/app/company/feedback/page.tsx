"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface Feedback {
  id: string; category: string; message: string; severity: string; status: string; createdAt: string; adminNotes?: string;
}

export default function FeedbackPage() {
  const { status } = useSession();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState({ total: 0, new: 0, critical: 0, resolved: 0 });
  const [filter, setFilter] = useState("NEW");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/company").then((r) => r.json()).then((data) => {
        const id = Array.isArray(data) ? data[0]?.id : (data?.organization?.id || data?.id);
        if (id) fetch(`/api/company/feedback?orgId=${id}&status=${filter}`).then((r) => r.json())
          .then((d) => { setFeedbacks(d.feedbacks || []); setStats(d.stats || {}); });
      });
    }
  }, [status, filter]);

  const resolve = async (id: string) => {
    await fetch("/api/company/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "RESOLVED" }),
    });
    setFeedbacks((p) => p.map((f) => f.id === id ? { ...f, status: "RESOLVED" } : f));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Anonymous Feedback</h1>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: <MessageSquare className="w-5 h-5" /> },
          { label: "New", value: stats.new, icon: <Clock className="w-5 h-5" />, alert: stats.new > 0 },
          { label: "Critical", value: stats.critical, icon: <AlertTriangle className="w-5 h-5" />, alert: stats.critical > 0 },
          { label: "Resolved", value: stats.resolved, icon: <CheckCircle className="w-5 h-5" /> },
        ].map((s) => (
          <Card key={s.label} className={`p-4 ${s.alert ? "border-2 border-red-300" : ""}`}>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </Card>
        ))}
      </div>
      <div className="flex space-x-2">
        {["NEW", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === s ? "bg-primary-600 text-white" : "bg-white border text-gray-600"}`}>{s}</button>
        ))}
      </div>
      {feedbacks.map((fb) => (
        <Card key={fb.id} className={`p-5 ${fb.severity === "CRITICAL" ? "border-l-4 border-l-red-500" : ""}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Badge variant={fb.severity === "CRITICAL" ? "danger" : fb.severity === "HIGH" ? "warning" : "default"}>{fb.severity}</Badge>
              <Badge>{fb.category.replace(/_/g, " ")}</Badge>
              <span className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
            </div>
            {fb.status !== "RESOLVED" && <Button size="sm" variant="outline" onClick={() => resolve(fb.id)}>Resolve</Button>}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{fb.message}</p>
        </Card>
      ))}
      {feedbacks.length === 0 && (
        <Card className="p-12 text-center"><MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500">No feedback in this category</p></Card>
      )}
    </div>
  );
}
