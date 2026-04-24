"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Heart, Send, Plus, MessageSquare, TrendingUp,
  Calendar, Star, Shield, CheckCircle, PenLine,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Tooltip from "@/components/ui/tooltip";
import { useToast } from "@/components/providers/toast-provider";

interface Partner { id: string; name: string; email: string; avatar: string | null }
interface Checkin { id: string; userId: string; communication: number; connection: number; conflict: number; gratitudeNote: string | null; date: string }
interface JournalEntry { id: string; userId: string; type: string; content: string; tags: string; createdAt: string; user: { name: string } }
interface Partnership {
  id: string; status: string; anniversary: string | null;
  loveLanguageA: string | null; loveLanguageB: string | null;
  sharedGoals: string; communicationStyle: string | null;
  partnerA: Partner; partnerB: Partner;
  checkins: Checkin[]; journals: JournalEntry[];
}

const LOVE_LANGUAGES = [
  { id: "WORDS", label: "Words of Affirmation", emoji: "💬" },
  { id: "ACTS", label: "Acts of Service", emoji: "🤝" },
  { id: "GIFTS", label: "Receiving Gifts", emoji: "🎁" },
  { id: "TIME", label: "Quality Time", emoji: "⏰" },
  { id: "TOUCH", label: "Physical Touch", emoji: "🫂" },
];

export default function PartnerPage() {
  const { data: session, status } = useSession();
  const toast = useToast();
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "checkin" | "journal">("overview");

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLang, setInviteLang] = useState("");
  const [inviting, setInviting] = useState(false);

  // Check-in form
  const [comm, setComm] = useState(7);
  const [conn, setConn] = useState(7);
  const [conf, setConf] = useState(7);
  const [gratNote, setGratNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Journal form
  const [journalContent, setJournalContent] = useState("");
  const [journalType, setJournalType] = useState("SHARED");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/couples").then((r) => r.json()).then((d) => { if (d?.id) setPartnership(d); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [status]);

  const myId = session?.user?.id;
  const partner = partnership ? (partnership.partnerA.id === myId ? partnership.partnerB : partnership.partnerA) : null;
  const myLang = partnership ? (partnership.partnerA.id === myId ? partnership.loveLanguageA : partnership.loveLanguageB) : null;
  const partnerLang = partnership ? (partnership.partnerA.id === myId ? partnership.loveLanguageB : partnership.loveLanguageA) : null;

  const invite = async () => {
    setInviting(true);
    try {
      const res = await fetch("/api/couples", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "invite", partnerEmail: inviteEmail, loveLanguage: inviteLang }) });
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "Could not send invite"); setInviting(false); return; }
      toast.success("Invite sent! Your partner will see a notification.");
      const data = await res.json();
      setPartnership(data);
    } catch { toast.error("Something went wrong"); }
    setInviting(false);
  };

  const accept = async () => {
    if (!partnership) return;
    const res = await fetch("/api/couples", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "accept", partnershipId: partnership.id, loveLanguage: inviteLang }) });
    if (res.ok) { toast.success("You are now connected!"); window.location.reload(); }
  };

  const submitCheckin = async () => {
    if (!partnership) return;
    setSubmitting(true);
    await fetch("/api/couples", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "checkin", partnershipId: partnership.id, communication: comm, connection: conn, conflict: conf, gratitudeNote: gratNote }) });
    toast.success("Check-in saved");
    setGratNote("");
    setSubmitting(false);
    window.location.reload();
  };

  const submitJournal = async () => {
    if (!partnership || !journalContent.trim()) return;
    setSubmitting(true);
    await fetch("/api/couples", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "journal", partnershipId: partnership.id, content: journalContent, type: journalType }) });
    toast.success(journalType === "SHARED" ? "Shared entry saved — your partner can see it" : "Private entry saved — only you can see it");
    setJournalContent("");
    setSubmitting(false);
    window.location.reload();
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  // No partnership — show invite flow
  if (!partnership || partnership.status === "ENDED") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-pink-100 dark:bg-pink-950 rounded-full flex items-center justify-center mx-auto mb-5">
            <Heart className="w-10 h-10 text-pink-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Partner Wellness</h1>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">
            Share your wellness journey with your partner. Daily check-ins, shared journals, and relationship health insights — while keeping your individual data 100% private.
          </p>
        </div>

        <Card className="p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invite your partner</h2>
          <p className="text-sm text-gray-500 mb-5">They need a Nishma account already. Enter their email to send a connection request.</p>
          <div className="space-y-4">
            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="partner@email.com" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your love language (optional)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LOVE_LANGUAGES.map((l) => (
                  <button key={l.id} onClick={() => setInviteLang(l.id)} className={`p-3 rounded-xl border-2 text-left text-sm transition-all ${inviteLang === l.id ? "border-pink-500 bg-pink-50 dark:bg-pink-950" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}>
                    <span className="text-lg mr-2">{l.emoji}</span>{l.label}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={invite} loading={inviting} className="w-full"><Send className="w-4 h-4 mr-2" /> Send Invite</Button>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center"><Shield className="w-4 h-4 mr-2 text-pink-500" /> Privacy promise</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Your individual journal, AI chats, and assessments are <strong>never</strong> shared</li>
            <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Only the <em>shared space</em> (check-ins, shared journal) is visible to both</li>
            <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Either partner can unlink at any time</li>
          </ul>
        </Card>
      </div>
    );
  }

  // Pending invite I received
  if (partnership.status === "PENDING" && partnership.partnerB.id === myId) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center">
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto"><Heart className="w-10 h-10 text-pink-500" /></div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{partnership.partnerA.name} invited you</h1>
        <p className="text-gray-500">They want to share a Couples Wellness journey with you on Nishma.</p>
        <div className="max-w-sm mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Your love language (optional)</label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {LOVE_LANGUAGES.map((l) => (
              <button key={l.id} onClick={() => setInviteLang(l.id)} className={`p-3 rounded-xl border-2 text-left text-sm ${inviteLang === l.id ? "border-pink-500 bg-pink-50" : "border-gray-200"}`}>
                <span className="mr-1">{l.emoji}</span>{l.label}
              </button>
            ))}
          </div>
          <Button onClick={accept} className="w-full"><Heart className="w-4 h-4 mr-2" /> Accept Invite</Button>
        </div>
      </div>
    );
  }

  // Pending — waiting for partner to accept
  if (partnership.status === "PENDING" && partnership.partnerA.id === myId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Waiting for {partnership.partnerB.name}</h1>
        <p className="text-gray-500 mt-2">Your invite is pending. They will see a notification next time they log in.</p>
      </div>
    );
  }

  // Active partnership — main dashboard
  const myCheckins = partnership.checkins.filter((c) => c.userId === myId);
  const partnerCheckins = partnership.checkins.filter((c) => c.userId !== myId);
  const avgMy = myCheckins.length > 0 ? Math.round((myCheckins.reduce((s, c) => s + c.communication + c.connection + c.conflict, 0) / (myCheckins.length * 3))) : null;
  const avgPartner = partnerCheckins.length > 0 ? Math.round((partnerCheckins.reduce((s, c) => s + c.communication + c.connection + c.conflict, 0) / (partnerCheckins.length * 3))) : null;
  const goals = JSON.parse(partnership.sharedGoals || "[]") as string[];
  const partnerLangObj = LOVE_LANGUAGES.find((l) => l.id === partnerLang);

  const Slider = ({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className={`text-lg font-bold ${color}`}>{value}/10</span>
      </div>
      <input type="range" min="1" max="10" value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            You &amp; {partner?.name?.split(" ")[0]}
            <Tooltip maxWidth={320} content="Your shared wellness space. Everything here is visible to both of you. Your individual journals, AI chats, and assessments stay 100% private." />
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {partnership.anniversary ? `Together since ${new Date(partnership.anniversary).toLocaleDateString()}` : "Couples wellness dashboard"}
          </p>
        </div>
        <Badge variant="success">Connected</Badge>
      </div>

      {/* Partner love language reminder */}
      {partnerLangObj && (
        <Card className="p-4 bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800">
          <p className="text-sm text-pink-800 dark:text-pink-200">
            <span className="text-lg mr-1">{partnerLangObj.emoji}</span>
            <strong>{partner?.name?.split(" ")[0]}&apos;s love language:</strong> {partnerLangObj.label}.
            Small gestures in this language go a long way.
          </p>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl max-w-md">
        {(["overview", "checkin", "journal"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium capitalize ${tab === t ? "bg-white dark:bg-gray-700 shadow-sm text-primary-700" : "text-gray-500"}`}>{t === "checkin" ? "Daily Check-in" : t}</button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center"><p className="text-2xl font-bold text-pink-600">{avgMy ?? "—"}</p><p className="text-xs text-gray-500">Your avg score</p></Card>
            <Card className="p-4 text-center"><p className="text-2xl font-bold text-purple-600">{avgPartner ?? "—"}</p><p className="text-xs text-gray-500">{partner?.name?.split(" ")[0]}&apos;s avg</p></Card>
            <Card className="p-4 text-center"><p className="text-2xl font-bold text-primary-600">{myCheckins.length}</p><p className="text-xs text-gray-500">Your check-ins</p></Card>
            <Card className="p-4 text-center"><p className="text-2xl font-bold text-primary-600">{partnership.journals.length}</p><p className="text-xs text-gray-500">Shared entries</p></Card>
          </div>

          {partnership.journals.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><MessageSquare className="w-4 h-4 mr-2" /> Recent shared entries</h3>
              <div className="space-y-3">
                {partnership.journals.slice(0, 5).map((j) => (
                  <div key={j.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{j.user.name}</span>
                      <span className="text-xs text-gray-400">{new Date(j.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{j.content}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Check-in tab */}
      {tab === "checkin" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Daily relationship check-in</h2>
          <p className="text-sm text-gray-500 mb-5">Rate today honestly — both partners can see each other&apos;s ratings.</p>
          <div className="space-y-5 max-w-md">
            <Slider label="Communication today" value={comm} onChange={setComm} color="text-blue-600" />
            <Slider label="Feeling connected" value={conn} onChange={setConn} color="text-pink-600" />
            <Slider label="Conflict level (10 = no conflict)" value={conf} onChange={setConf} color="text-green-600" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Something I appreciate about you today</label>
              <input type="text" value={gratNote} onChange={(e) => setGratNote(e.target.value)} placeholder="e.g. You listened when I needed to vent" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
            </div>
            <Button onClick={submitCheckin} loading={submitting} className="w-full"><Heart className="w-4 h-4 mr-2" /> Save Check-in</Button>
          </div>
        </Card>
      )}

      {/* Journal tab */}
      {tab === "journal" && (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Write together</h2>
            <p className="text-sm text-gray-500 mb-4">Shared entries are visible to both. Private entries stay yours.</p>
            <div className="flex space-x-2 mb-4">
              <button onClick={() => setJournalType("SHARED")} className={`px-4 py-2 rounded-lg text-sm font-medium ${journalType === "SHARED" ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-600"}`}>Shared</button>
              <button onClick={() => setJournalType("PRIVATE")} className={`px-4 py-2 rounded-lg text-sm font-medium ${journalType === "PRIVATE" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"}`}>Private (only me)</button>
            </div>
            <textarea rows={4} value={journalContent} onChange={(e) => setJournalContent(e.target.value)} placeholder={journalType === "SHARED" ? "Write something for both of you..." : "Write something just for yourself..."} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none" />
            <Button onClick={submitJournal} loading={submitting} className="mt-3"><PenLine className="w-4 h-4 mr-2" /> Save Entry</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
