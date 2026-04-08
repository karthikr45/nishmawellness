"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Heart, Send, Star, Users, Sparkles, HandHeart, ThumbsUp } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";

interface Recognition {
  id: string; message: string; category: string; isAnonymous: boolean;
  likes: number; createdAt: string; toName: string;
}

const CATEGORIES = [
  { id: "SUPPORT", label: "Emotional Support", emoji: "💙" },
  { id: "KINDNESS", label: "Act of Kindness", emoji: "🌟" },
  { id: "TEAMWORK", label: "Great Teamwork", emoji: "🤝" },
  { id: "MENTORING", label: "Mentoring", emoji: "🎯" },
  { id: "POSITIVITY", label: "Spreading Positivity", emoji: "☀️" },
  { id: "RESILIENCE", label: "Showing Resilience", emoji: "💪" },
];

export default function RecognitionPage() {
  const { status } = useSession();
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [showSend, setShowSend] = useState(false);
  const [members, setMembers] = useState<{ id: string; user: { id: string; name: string } }[]>([]);
  const [form, setForm] = useState({ toUserId: "", message: "", category: "KINDNESS", isAnonymous: true });
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [catStats, setCatStats] = useState<Record<string, number>>({});

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/company").then((r) => r.json()).then((org) => {
        const id = Array.isArray(org) ? org[0]?.id : (org?.organization?.id || org?.id);
        if (id) {
          setOrgId(id);
          fetch(`/api/company/recognition?orgId=${id}`).then((r) => r.json())
            .then((d) => { setRecognitions(d.recognitions || []); setCatStats(d.categoryStats || {}); });
          fetch(`/api/company/members?orgId=${id}`).then((r) => r.json()).then(setMembers);
        }
      });
    }
  }, [status]);

  const sendRecognition = async () => {
    if (!orgId || !form.toUserId || !form.message) return;
    setSaving(true);
    await fetch("/api/company/recognition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, organizationId: orgId }),
    });
    setShowSend(false);
    setForm({ toUserId: "", message: "", category: "KINDNESS", isAnonymous: true });
    // Refresh
    const res = await fetch(`/api/company/recognition?orgId=${orgId}`);
    const d = await res.json();
    setRecognitions(d.recognitions || []);
    setCatStats(d.categoryStats || {});
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Peer Recognition Wall</h1>
          <p className="text-gray-500 mt-1">Celebrate colleagues who make a difference</p>
        </div>
        <Button onClick={() => setShowSend(true)}>
          <Heart className="w-4 h-4 mr-2" /> Recognize Someone
        </Button>
      </div>

      {/* Category Stats */}
      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border rounded-xl">
            <span>{cat.emoji}</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">{cat.label}</span>
            <Badge variant="default">{catStats[cat.id] || 0}</Badge>
          </div>
        ))}
      </div>

      {/* Recognition Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recognitions.map((r) => {
          const cat = CATEGORIES.find((c) => c.id === r.category);
          return (
            <Card key={r.id} className="p-5">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{cat?.emoji || "🌟"}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{r.toName}</p>
                    <Badge variant="success">{cat?.label || r.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">&ldquo;{r.message}&rdquo;</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">
                      {r.isAnonymous ? "From a colleague" : ""} &middot; {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    <button className="flex items-center space-x-1 text-xs text-gray-400 hover:text-red-500">
                      <ThumbsUp className="w-3 h-3" /> <span>{r.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {recognitions.length === 0 && (
        <Card className="p-12 text-center">
          <HandHeart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">No recognitions yet. Be the first to appreciate a colleague!</p>
          <Button onClick={() => setShowSend(true)}><Heart className="w-4 h-4 mr-2" /> Send Recognition</Button>
        </Card>
      )}

      {/* Send Modal */}
      <Modal isOpen={showSend} onClose={() => setShowSend(false)} title="Recognize a Colleague" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Who are you recognizing?</label>
            <select value={form.toUserId} onChange={(e) => setForm((p) => ({ ...p, toUserId: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
              <option value="">Select a colleague</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => setForm((p) => ({ ...p, category: cat.id }))}
                  className={`p-3 rounded-xl border-2 text-sm text-center transition-all ${
                    form.category === cat.id ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <span className="text-lg">{cat.emoji}</span>
                  <p className="text-xs mt-1">{cat.label}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
            <textarea rows={3} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Tell them why they're appreciated..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
          </div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm((p) => ({ ...p, isAnonymous: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded" />
            <span className="text-sm text-gray-600">Send anonymously</span>
          </label>
          <Button onClick={sendRecognition} loading={saving} className="w-full" disabled={!form.toUserId || !form.message}>
            <Heart className="w-4 h-4 mr-2" /> Send Recognition
          </Button>
        </div>
      </Modal>
    </div>
  );
}
