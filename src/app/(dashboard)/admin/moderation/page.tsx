"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Shield, AlertTriangle, CheckCircle, Eye, Clock,
  BarChart3, Filter, FileText,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface ModerationFlag {
  id: string;
  userId: string;
  sessionId: string;
  reason: string;
  severity: string;
  messageSnippet?: string;
  status: string;
  reviewNotes?: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

interface AuditLog {
  id: string;
  action: string;
  category?: string;
  severity?: string;
  messageSnippet?: string;
  createdAt: string;
  user: { name: string; email: string };
}

export default function AdminModeration() {
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState("flags");
  const [flags, setFlags] = useState<ModerationFlag[]>([]);
  const [flagStats, setFlagStats] = useState({ pending: 0, critical: 0, reviewed: 0 });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditStats, setAuditStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, today: 0 });
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchFlags();
      fetchAudit();
    }
  }, [status, statusFilter]);

  const fetchFlags = () => {
    fetch(`/api/compliance/moderation?status=${statusFilter}`)
      .then((r) => r.json())
      .then((d) => { setFlags(d.flags); setFlagStats(d.stats); })
      .catch(console.error);
  };

  const fetchAudit = () => {
    fetch("/api/compliance/audit")
      .then((r) => r.json())
      .then((d) => { setAuditLogs(d.logs); setAuditStats(d.stats); })
      .catch(console.error);
  };

  const resolveFlag = async (id: string, newStatus: string) => {
    await fetch("/api/compliance/moderation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus, reviewNotes }),
    });
    setReviewing(null);
    setReviewNotes("");
    fetchFlags();
  };

  const severityColor = (s: string) => {
    switch (s) {
      case "CRITICAL": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "HIGH": return "bg-orange-100 text-orange-700";
      case "MEDIUM": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Moderation</h1>
        <p className="text-gray-500 mt-1">Monitor AI safety, review flagged content, and audit compliance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Pending Flags", value: flagStats.pending, icon: <Clock className="w-5 h-5" />, color: "bg-yellow-100 text-yellow-600", alert: flagStats.pending > 0 },
          { label: "Critical", value: flagStats.critical, icon: <AlertTriangle className="w-5 h-5" />, color: "bg-red-100 text-red-600", alert: flagStats.critical > 0 },
          { label: "Reviewed", value: flagStats.reviewed, icon: <CheckCircle className="w-5 h-5" />, color: "bg-green-100 text-green-600" },
          { label: "Audit Events Today", value: auditStats.today, icon: <BarChart3 className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
          { label: "Total Audit Logs", value: auditStats.total, icon: <FileText className="w-5 h-5" />, color: "bg-purple-100 text-purple-600" },
        ].map((stat) => (
          <Card key={stat.label} className={`p-4 ${stat.alert ? "border-2 border-red-300 dark:border-red-700" : ""}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color} mb-2`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl max-w-sm">
        <button onClick={() => setActiveTab("flags")}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium ${activeTab === "flags" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500"}`}>
          Flags {flagStats.pending > 0 && <span className="ml-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full inline-flex items-center justify-center">{flagStats.pending}</span>}
        </button>
        <button onClick={() => setActiveTab("audit")}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium ${activeTab === "audit" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500"}`}>
          Audit Log
        </button>
      </div>

      {/* Flags Tab */}
      {activeTab === "flags" && (
        <>
          <div className="flex space-x-2">
            {["PENDING", "REVIEWED", "RESOLVED", "ESCALATED"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === s ? "bg-primary-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 border"}`}>
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {flags.map((flag) => (
              <Card key={flag.id} className={`p-5 ${flag.severity === "CRITICAL" ? "border-l-4 border-l-red-500" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={severityColor(flag.severity)}>{flag.severity}</Badge>
                      <Badge variant="default">{flag.reason}</Badge>
                      <span className="text-xs text-gray-400">{new Date(flag.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{flag.user.name} ({flag.user.email})</p>
                    {flag.messageSnippet && (
                      <p className="text-sm text-gray-500 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg italic">
                        &ldquo;{flag.messageSnippet}&rdquo;
                      </p>
                    )}
                    {flag.reviewNotes && (
                      <p className="text-xs text-gray-500 mt-2">Review: {flag.reviewNotes}</p>
                    )}
                  </div>
                  {flag.status === "PENDING" && (
                    <div className="flex flex-col space-y-2 ml-4">
                      {reviewing === flag.id ? (
                        <div className="space-y-2 w-48">
                          <textarea rows={2} value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Review notes..." className="w-full px-3 py-2 border rounded-lg text-xs" />
                          <div className="flex space-x-1">
                            <Button size="sm" variant="primary" onClick={() => resolveFlag(flag.id, "RESOLVED")} className="flex-1">Resolve</Button>
                            <Button size="sm" variant="danger" onClick={() => resolveFlag(flag.id, "ESCALATED")} className="flex-1">Escalate</Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setReviewing(flag.id)}>
                          <Eye className="w-4 h-4 mr-1" /> Review
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {flags.length === 0 && (
              <Card className="p-12 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-green-300" />
                <p className="text-gray-500">No {statusFilter.toLowerCase()} flags</p>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Audit Tab */}
      {activeTab === "audit" && (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 30).map((log) => (
                <tr key={log.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{log.user.name}</td>
                  <td className="px-4 py-3"><Badge variant="default">{log.action}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{log.category || "—"}</td>
                  <td className="px-4 py-3">
                    {log.severity ? <Badge className={severityColor(log.severity)}>{log.severity}</Badge> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
