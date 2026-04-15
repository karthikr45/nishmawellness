"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Target, Plus, Calendar, Users, Trophy } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";
import EmptyState from "@/components/ui/empty-state";

interface Challenge {
  id: string; title: string; description: string; type: string; target: number; unit: string;
  startDate: string; endDate: string; prize?: string; participantCount: number; myProgress: number; joined: boolean;
}

export default function ChallengesPage() {
  const { status } = useSession();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "MEDITATION", target: "30", unit: "minutes", startDate: "", endDate: "", prize: "" });
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/company").then((r) => r.json()).then((data) => {
        const id = Array.isArray(data) ? data[0]?.id : (data?.organization?.id || data?.id);
        if (id) { setOrgId(id); fetch(`/api/company/challenges?orgId=${id}`).then((r) => r.json()).then(setChallenges); }
      });
    }
  }, [status]);

  const create = async () => {
    if (!orgId) return;
    setSaving(true);
    await fetch("/api/company/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, organizationId: orgId, target: parseInt(form.target) }),
    });
    setShowCreate(false);
    const res = await fetch(`/api/company/challenges?orgId=${orgId}`);
    setChallenges(await res.json());
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wellness Challenges</h1>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" /> Create Challenge</Button>
      </div>
      {challenges.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Target className="w-16 h-16" />}
            title="No challenges yet"
            description="Run team challenges like a step-count week, a 7-day meditation streak, or a journal habit. Friendly competition is one of the best drivers of sustained wellness engagement."
            action={
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create Your First Challenge
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((c) => (
            <Card key={c.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <Badge>{c.type}</Badge>
                {c.prize && <Badge variant="warning"><Trophy className="w-3 h-3 mr-1" /> {c.prize}</Badge>}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{c.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{c.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-400 mt-3">
                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}</span>
                <span className="flex items-center"><Users className="w-3 h-3 mr-1" />{c.participantCount} joined</span>
                <span>Target: {c.target} {c.unit}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Challenge" size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g., 30-Day Meditation Challenge" />
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                <option value="MEDITATION">Meditation</option><option value="STEPS">Steps</option>
                <option value="JOURNAL">Journaling</option><option value="EXERCISE">Exercise</option></select></div>
            <Input label="Target" type="number" value={form.target} onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))} />
            <Input label="Unit" value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
            <Input label="End Date" type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
          </div>
          <Input label="Prize (optional)" value={form.prize} onChange={(e) => setForm((p) => ({ ...p, prize: e.target.value }))} placeholder="e.g., Gift card, Extra day off" />
          <Button onClick={create} loading={saving} className="w-full" disabled={!form.title || !form.startDate}>Create Challenge</Button>
        </div>
      </Modal>
    </div>
  );
}
