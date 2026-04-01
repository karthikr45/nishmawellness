"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Brain, Eye, CheckCircle, AlertTriangle, MessageSquare,
  Calendar, Star, FileText, Zap, ArrowRight, Clock,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";

interface CloneSession {
  sessionId: string;
  patient: { id: string; name: string; email: string };
  messageCount: number;
  lastMessage: { content: string; role: string; createdAt: string };
  startedAt: string;
  reviewStatus: string;
  reviewId: string | null;
}

interface Handoff {
  id: string;
  patient: { id: string; name: string };
  aiSummary: string;
  keyTopics: string[];
  moodTrend: string;
  riskFlags: string[];
  suggestedFocus: string[];
  chatCount: number;
  isRead: boolean;
  createdAt: string;
}

export default function TwinCloneReviews() {
  const { status } = useSession();
  const [sessions, setSessions] = useState<CloneSession[]>([]);
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [activeTab, setActiveTab] = useState("sessions");
  const [selectedSession, setSelectedSession] = useState<CloneSession | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string; createdAt: string }[]>([]);
  const [reviewForm, setReviewForm] = useState({ feedback: "", accuracy: 5 });
  const [generating, setGenerating] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/twinclone/reviews").then((r) => r.json()).then(setSessions).catch(console.error);
      fetch("/api/twinclone/handoff").then((r) => r.json()).then(setHandoffs).catch(console.error);
    }
  }, [status]);

  const viewSession = async (session: CloneSession) => {
    setSelectedSession(session);
    const res = await fetch(`/api/ai-chat?sessionId=${session.sessionId}`);
    const data = await res.json();
    setChatMessages(data);
  };

  const submitReview = async () => {
    if (!selectedSession) return;
    setSaving(true);
    try {
      await fetch("/api/twinclone/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession.sessionId,
          patientId: selectedSession.patient.id,
          status: "REVIEWED",
          feedback: reviewForm.feedback,
          accuracy: reviewForm.accuracy,
        }),
      });
      setSessions((prev) =>
        prev.map((s) => s.sessionId === selectedSession.sessionId ? { ...s, reviewStatus: "REVIEWED" } : s)
      );
      setSelectedSession(null);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const generateHandoff = async (patientId: string) => {
    setGenerating(patientId);
    try {
      const res = await fetch("/api/twinclone/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      const handoff = await res.json();
      setHandoffs((prev) => [handoff, ...prev]);
    } catch (err) { console.error(err); }
    setGenerating(null);
  };

  const pendingCount = sessions.filter((s) => s.reviewStatus === "PENDING").length;
  const uniquePatients = new Set(sessions.map((s) => s.patient.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">TwinClone Oversight</h1>
        <p className="text-gray-500 mt-1">Review your AI clone&apos;s conversations and generate session handoffs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Conversations", value: sessions.length, icon: <MessageSquare className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
          { label: "Pending Review", value: pendingCount, icon: <Eye className="w-5 h-5" />, color: pendingCount > 0 ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600" },
          { label: "Unique Patients", value: uniquePatients.size, icon: <Brain className="w-5 h-5" />, color: "bg-purple-100 text-purple-600" },
          { label: "Handoffs Created", value: handoffs.length, icon: <FileText className="w-5 h-5" />, color: "bg-orange-100 text-orange-600" },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl max-w-md">
        {[
          { id: "sessions", label: "Chat Sessions", icon: <MessageSquare className="w-4 h-4" /> },
          { id: "handoffs", label: "Session Handoffs", icon: <FileText className="w-4 h-4" /> },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-white text-primary-700 shadow-sm" : "text-gray-500"
            }`}>
            {tab.icon}<span>{tab.label}</span>
            {tab.id === "sessions" && pendingCount > 0 && (
              <span className="w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.sessionId} className={`p-5 ${s.reviewStatus === "PENDING" ? "border-l-4 border-l-yellow-400" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                    {s.patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{s.patient.name}</h3>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center"><MessageSquare className="w-3 h-3 mr-1" />{s.messageCount} messages</span>
                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{new Date(s.startedAt).toLocaleDateString()}</span>
                    </div>
                    {s.lastMessage && (
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-md">
                        Last: &ldquo;{s.lastMessage.content.substring(0, 80)}...&rdquo;
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={s.reviewStatus === "REVIEWED" ? "success" : s.reviewStatus === "FLAGGED" ? "danger" : "warning"}>
                    {s.reviewStatus}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => viewSession(s)}>
                    <Eye className="w-4 h-4 mr-1" /> Review
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => generateHandoff(s.patient.id)} loading={generating === s.patient.id}>
                    <Zap className="w-4 h-4 mr-1" /> Handoff
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {sessions.length === 0 && (
            <Card className="p-12 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No AI clone conversations yet</p>
            </Card>
          )}
        </div>
      )}

      {/* Handoffs Tab */}
      {activeTab === "handoffs" && (
        <div className="space-y-4">
          {handoffs.map((h) => (
            <Card key={h.id} className={`p-6 ${h.riskFlags.length > 0 ? "border-l-4 border-l-red-500" : ""}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                    {h.patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{h.patient.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />{new Date(h.createdAt).toLocaleDateString()} &middot; {h.chatCount} AI chats
                    </p>
                  </div>
                </div>
                {h.moodTrend && (
                  <Badge variant={h.moodTrend === "improving" ? "success" : h.moodTrend === "declining" ? "danger" : "default"}>
                    Mood: {h.moodTrend}
                  </Badge>
                )}
              </div>

              {/* Risk Flags */}
              {h.riskFlags.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <p className="text-sm font-medium text-red-800 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" /> Risk Flags Detected
                  </p>
                  {h.riskFlags.map((flag, i) => (
                    <p key={i} className="text-sm text-red-700 ml-6 mt-1">&bull; {flag}</p>
                  ))}
                </div>
              )}

              {/* AI Summary */}
              <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <p className="text-xs font-medium text-gray-400 uppercase mb-1">AI Summary</p>
                <p className="text-sm text-gray-700 leading-relaxed">{h.aiSummary}</p>
              </div>

              {/* Topics and Focus */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-2">Key Topics</p>
                  <div className="flex flex-wrap gap-1">
                    {h.keyTopics.map((t, i) => (
                      <Badge key={i} variant="info">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-2">Suggested Session Focus</p>
                  <div className="space-y-1">
                    {h.suggestedFocus.map((f, i) => (
                      <p key={i} className="text-xs text-gray-600 flex items-center">
                        <ArrowRight className="w-3 h-3 mr-1 text-primary-500" />{f}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {handoffs.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">No handoff summaries yet</p>
              <p className="text-sm text-gray-400">Generate a handoff from the Chat Sessions tab to prepare for your next live session.</p>
            </Card>
          )}
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={!!selectedSession} onClose={() => setSelectedSession(null)} title={`Review: ${selectedSession?.patient.name}`} size="lg">
        <div className="space-y-4">
          {/* Chat transcript */}
          <div className="max-h-80 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-xl">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === "user" ? "bg-primary-600 text-white" : "bg-white text-gray-800 shadow-sm"
                }`}>
                  {msg.role === "assistant" && <p className="text-xs text-gray-400 mb-1">Your AI Clone</p>}
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Review form */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accuracy Rating: {reviewForm.accuracy}/5
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} onClick={() => setReviewForm((p) => ({ ...p, accuracy: r }))}>
                  <Star className={`w-6 h-6 ${r <= reviewForm.accuracy ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback / Corrections</label>
            <textarea rows={3} value={reviewForm.feedback}
              onChange={(e) => setReviewForm((p) => ({ ...p, feedback: e.target.value }))}
              placeholder="Any corrections or feedback on how the AI responded..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setSelectedSession(null)} className="flex-1">Close</Button>
            <Button onClick={submitReview} loading={saving} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" /> Approve & Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
