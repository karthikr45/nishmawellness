"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Shield, Trash2, Download, Eye, Lock, Database,
  AlertTriangle, CheckCircle, FileText,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";

interface DataSummary {
  user: { email: string; name: string; memberSince: string };
  consent: { givenAt: string; type: string; version: string } | null;
  dataStored: Record<string, number>;
  totalRecords: number;
}

export default function DataPrivacyPage() {
  const { status } = useSession();
  const [data, setData] = useState<DataSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/compliance/data").then((r) => r.json()).then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [status]);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setDeleting(true);
    try {
      await fetch("/api/compliance/data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: deleteCategory }),
      });
      setDeleted(deleteCategory);
      setShowDeleteModal(false);
      setConfirmText("");
      // Refresh data
      const res = await fetch("/api/compliance/data");
      setData(await res.json());
    } catch (err) { console.error(err); }
    setDeleting(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  }

  const categoryLabels: Record<string, { label: string; deleteKey: string; desc: string }> = {
    "AI Chat Messages": { label: "AI Conversations", deleteKey: "ai_chats", desc: "All AI chat history and extracted memories" },
    "Journal Entries": { label: "Journal Entries", deleteKey: "journals", desc: "Daily check-in journals" },
    "Progress Records": { label: "Progress Tracking", deleteKey: "progress", desc: "Mood, sleep, exercise tracking data" },
    "Assessments": { label: "Assessments", deleteKey: "assessments", desc: "PHQ-9, GAD-7 results" },
    "AI Memories (Topics)": { label: "AI Memories", deleteKey: "ai_memories", desc: "Topics and patterns learned by AI" },
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data & Privacy</h1>
        <p className="text-gray-500 mt-1">Manage your data and privacy settings</p>
      </div>

      {deleted && (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 rounded-xl text-green-700 dark:text-green-300 text-sm flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" /> Data deleted successfully: {deleted}
        </div>
      )}

      {/* Consent Status */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-primary-600" /> AI Consent Status
        </h2>
        {data?.consent ? (
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-xl">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Consent Given</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {new Date(data.consent.givenAt).toLocaleDateString()} &middot; Version {data.consent.version} &middot; Type: {data.consent.type}
                </p>
              </div>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-xl">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">No AI consent on file. You&apos;ll be prompted before using AI features.</p>
          </div>
        )}
      </Card>

      {/* Data Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-600" /> Your Data
          </h2>
          <Badge variant="info">{data?.totalRecords || 0} total records</Badge>
        </div>
        <p className="text-sm text-gray-500 mb-4">Here&apos;s what we store to personalize your wellness experience:</p>
        <div className="space-y-3">
          {data && Object.entries(data.dataStored).map(([key, count]) => {
            const info = categoryLabels[key];
            return (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{key}</p>
                    {info && <p className="text-xs text-gray-400">{info.desc}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{count}</span>
                  {info && (
                    <Button size="sm" variant="ghost" onClick={() => { setDeleteCategory(info.deleteKey); setShowDeleteModal(true); }}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* What We Don't Store */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2 text-green-600" /> What We Don&apos;t Store
        </h2>
        <div className="space-y-2">
          {[
            "Your real-time video therapy sessions (not recorded)",
            "Your password in plain text (only encrypted hash)",
            "Payment card details (handled by Stripe)",
            "Browsing history outside this platform",
            "Location data or GPS coordinates",
          ].map((item, i) => (
            <div key={i} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-2 border-red-200 dark:border-red-800">
        <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" /> Delete All My Data
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          This permanently deletes all your wellness data including AI conversations, journal entries, progress records, assessments, and AI memories. This action cannot be undone.
        </p>
        <Button variant="danger" onClick={() => { setDeleteCategory("all"); setShowDeleteModal(true); }}>
          <Trash2 className="w-4 h-4 mr-2" /> Delete All My Data
        </Button>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setConfirmText(""); }} title="Confirm Data Deletion" size="sm">
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-xl">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {deleteCategory === "all"
                ? "This will permanently delete ALL your wellness data."
                : `This will permanently delete your ${deleteCategory.replace("_", " ")}.`}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">This action cannot be undone.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500" />
          </div>
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={() => { setShowDeleteModal(false); setConfirmText(""); }} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting} disabled={confirmText !== "DELETE"} className="flex-1">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
