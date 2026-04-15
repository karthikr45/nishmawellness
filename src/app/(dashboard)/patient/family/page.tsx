"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Users, Plus, Heart, Target, UserPlus, Crown,
  Shield, Trash2, Mail, CheckCircle, Star,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";
import Tooltip from "@/components/ui/tooltip";

interface FamilyGroup {
  id: string;
  name: string;
  plan: string;
  maxMembers: number;
  sharedGoals: string;
  members: {
    id: string;
    role: string;
    canViewProgress: boolean;
    isMinor: boolean;
    user: { id: string; name: string; email: string };
  }[];
  owner?: { id: string; name: string; email: string };
}

export default function PatientFamily() {
  const { data: session, status } = useSession();
  const [family, setFamily] = useState<FamilyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createName, setCreateName] = useState("");
  const [inviteForm, setInviteForm] = useState({ email: "", role: "MEMBER", isMinor: false, canViewProgress: false });
  const [newGoal, setNewGoal] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/family")
        .then((r) => r.json())
        .then((data) => { setFamily(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const createFamily = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        // Refresh
        const data = await fetch("/api/family").then((r) => r.json());
        setFamily(data);
      } else {
        const err = await res.json();
        setError(err.error);
      }
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const inviteMember = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/family/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });
      if (res.ok) {
        setShowInviteModal(false);
        setInviteForm({ email: "", role: "MEMBER", isMinor: false, canViewProgress: false });
        setSuccess("Family member added!");
        setTimeout(() => setSuccess(""), 3000);
        const data = await fetch("/api/family").then((r) => r.json());
        setFamily(data);
      } else {
        const err = await res.json();
        setError(err.error);
      }
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const removeMember = async (userId: string) => {
    if (!confirm("Remove this family member?")) return;
    await fetch("/api/family/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await fetch("/api/family").then((r) => r.json());
    setFamily(data);
  };

  const addSharedGoal = async () => {
    if (!newGoal.trim() || !family) return;
    const goals = JSON.parse(family.sharedGoals || "[]");
    goals.push(newGoal.trim());
    await fetch("/api/family", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sharedGoals: goals }),
    });
    setFamily((prev) => prev ? { ...prev, sharedGoals: JSON.stringify(goals) } : prev);
    setNewGoal("");
    setShowGoalModal(false);
  };

  const isOwner = family?.owner?.id === session?.user?.id ||
    family?.members?.some((m) => m.user.id === session?.user?.id && m.role === "PRIMARY");

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  }

  const roleIcons: Record<string, React.ReactNode> = {
    PRIMARY: <Crown className="w-4 h-4 text-yellow-500" />,
    SPOUSE: <Heart className="w-4 h-4 text-pink-500" />,
    CHILD: <Star className="w-4 h-4 text-blue-500" />,
    PARENT: <Shield className="w-4 h-4 text-green-500" />,
    SIBLING: <Users className="w-4 h-4 text-purple-500" />,
    MEMBER: <Users className="w-4 h-4 text-gray-500" />,
  };

  if (!family) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          Family Wellness
          <Tooltip
            maxWidth={340}
            content="Share wellness goals and selected progress with up to 5 family members on a single plan. Each member has their own private account — you only see what they explicitly opt to share. Minors get extra age-appropriate protections by default."
          />
        </h1>
        <Card className="p-12 text-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-pink-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Start Your Family Wellness Journey</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Create a family group to share wellness goals, track family progress together,
            and access family therapy sessions. Each member gets their own private account.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
            {[
              { icon: <Target className="w-6 h-6" />, title: "Shared Goals", desc: "Set and track family wellness goals together" },
              { icon: <Shield className="w-6 h-6" />, title: "Individual Privacy", desc: "Each member's data stays private" },
              { icon: <Heart className="w-6 h-6" />, title: "Family Sessions", desc: "Book family therapy sessions" },
            ].map((f) => (
              <div key={f.title} className="p-4 bg-gray-50 rounded-xl text-center">
                <div className="text-pink-500 flex justify-center mb-2">{f.icon}</div>
                <p className="text-sm font-medium text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" /> Create Family Group
          </Button>
        </Card>

        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Family Group">
          <div className="space-y-4">
            <Input label="Family Name" placeholder="e.g., The Thompson Family" value={createName}
              onChange={(e) => setCreateName(e.target.value)} />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button onClick={createFamily} loading={saving} className="w-full" disabled={!createName}>
              Create Family Group
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  const goals = JSON.parse(family.sharedGoals || "[]") as string[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{family.name}</h1>
          <p className="text-gray-500 mt-1">
            {family.members.length} member{family.members.length !== 1 ? "s" : ""} &middot;
            <Badge className="ml-2">{family.plan.replace("_", " ")}</Badge>
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Member
          </Button>
        )}
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" /> {success}
        </div>
      )}

      {/* Family Members */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Family Members</h2>
        <div className="space-y-3">
          {family.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-medium">
                  {member.user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">{member.user.name}</p>
                    {roleIcons[member.role]}
                    {member.isMinor && <Badge variant="info">Minor</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge>{member.role}</Badge>
                {member.canViewProgress && (
                  <span className="text-xs text-green-600 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Shares progress</span>
                )}
                {isOwner && member.role !== "PRIMARY" && (
                  <button onClick={() => removeMember(member.user.id)} className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Shared Family Goals */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary-600" /> Shared Family Goals
          </h2>
          <Button size="sm" variant="outline" onClick={() => setShowGoalModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Goal
          </Button>
        </div>
        {goals.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No shared goals yet. Add one to get started!</p>
        ) : (
          <div className="space-y-2">
            {goals.map((goal, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-primary-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{goal}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Family Wellness Activities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover className="p-6 text-center cursor-pointer" onClick={() => window.location.href = "/book"}>
          <Heart className="w-8 h-8 text-pink-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Family Therapy</h3>
          <p className="text-sm text-gray-500 mt-1">Book a family therapy session with a licensed therapist</p>
        </Card>
        <Card hover className="p-6 text-center cursor-pointer" onClick={() => window.location.href = "/patient/exercises"}>
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Family Exercises</h3>
          <p className="text-sm text-gray-500 mt-1">Do guided exercises together as a family</p>
        </Card>
        <Card hover className="p-6 text-center cursor-pointer" onClick={() => window.location.href = "/patient/groups"}>
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Group Sessions</h3>
          <p className="text-sm text-gray-500 mt-1">Join family-friendly wellness workshops</p>
        </Card>
      </div>

      {/* Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Add Family Member">
        <div className="space-y-4">
          <Input label="Email Address" type="email" value={inviteForm.email}
            onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="family.member@email.com" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
            <select value={inviteForm.role}
              onChange={(e) => setInviteForm((p) => ({ ...p, role: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
              <option value="SPOUSE">Spouse / Partner</option>
              <option value="CHILD">Child</option>
              <option value="PARENT">Parent</option>
              <option value="SIBLING">Sibling</option>
              <option value="MEMBER">Other</option>
            </select>
          </div>
          <label className="flex items-center space-x-3">
            <input type="checkbox" checked={inviteForm.isMinor}
              onChange={(e) => setInviteForm((p) => ({ ...p, isMinor: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded" />
            <span className="text-sm text-gray-700">This member is a minor (under 18)</span>
          </label>
          <label className="flex items-center space-x-3">
            <input type="checkbox" checked={inviteForm.canViewProgress}
              onChange={(e) => setInviteForm((p) => ({ ...p, canViewProgress: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded" />
            <span className="text-sm text-gray-700">Allow sharing wellness progress with family</span>
          </label>
          <div className="p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-700">
              <Shield className="w-3 h-3 inline mr-1" />
              The member must have a Nishma account. Their individual therapy data remains private.
            </p>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button onClick={inviteMember} loading={saving} className="w-full" disabled={!inviteForm.email}>
            <UserPlus className="w-4 h-4 mr-2" /> Add to Family
          </Button>
        </div>
      </Modal>

      {/* Goal Modal */}
      <Modal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} title="Add Family Goal">
        <div className="space-y-4">
          <Input label="Goal" value={newGoal} onChange={(e) => setNewGoal(e.target.value)}
            placeholder="e.g., Have a family dinner without screens 3x per week" />
          <div className="flex flex-wrap gap-2">
            {["Daily family meditation", "Weekly family walk", "Screen-free evenings", "Gratitude sharing at dinner", "Read together 30 min/day"].map((suggestion) => (
              <button key={suggestion} onClick={() => setNewGoal(suggestion)}
                className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-primary-50 hover:text-primary-700">
                {suggestion}
              </button>
            ))}
          </div>
          <Button onClick={addSharedGoal} className="w-full" disabled={!newGoal.trim()}>
            Add Goal
          </Button>
        </div>
      </Modal>
    </div>
  );
}
