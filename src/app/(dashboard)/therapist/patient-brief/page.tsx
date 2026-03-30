"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Brain, TrendingUp, TrendingDown, Minus, Calendar, FileText,
  BookOpen, Heart, AlertTriangle, Plus, Save, CheckCircle,
  Clock, User, Activity, Sparkles, Shield, MessageSquare,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface PatientBrief {
  patient: { id: string; name: string; email: string; phone?: string; createdAt: string; lastLoginAt?: string };
  context: {
    keyTopics: string[];
    lifeEvents: string[];
    copingTools: string[];
    triggers: string[];
    preferences: string[];
    summary: string;
  } | null;
  sessionHistory: { totalSessions: number; daysSinceLastSession: number | null; lastSessionDate: string | null };
  recentNotes: { date: string; content: string; mood?: string; progress?: string; homework?: string }[];
  wellnessSnapshot: { avgMood: number | null; moodTrend: string; recentSleep: { value: number }[]; recentExercise: { value: number }[] };
  activePrograms: { title: string; category: string; progress: number; status: string }[];
  aiInsights: { recentChatThemes: string[]; memories: { category: string; content: string; source: string }[] };
  upcomingAppointments: { id: string; dateTime: string }[];
}

function PatientBriefContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  const [brief, setBrief] = useState<PatientBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [contextForm, setContextForm] = useState({
    keyTopics: [] as string[],
    lifeEvents: [] as string[],
    copingTools: [] as string[],
    triggers: [] as string[],
    preferences: [] as string[],
    summary: "",
  });
  const [newItem, setNewItem] = useState({ field: "", value: "" });

  useEffect(() => {
    if (status === "authenticated" && patientId) {
      fetch(`/api/patient-context?patientId=${patientId}`)
        .then((r) => r.json())
        .then((data) => {
          setBrief(data);
          if (data.context) {
            setContextForm({
              keyTopics: data.context.keyTopics,
              lifeEvents: data.context.lifeEvents,
              copingTools: data.context.copingTools,
              triggers: data.context.triggers,
              preferences: data.context.preferences,
              summary: data.context.summary,
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, patientId]);

  const addItem = (field: string) => {
    if (!newItem.value.trim()) return;
    setContextForm((prev) => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), newItem.value.trim()],
    }));
    setNewItem({ field: "", value: "" });
  };

  const removeItem = (field: string, index: number) => {
    setContextForm((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index),
    }));
  };

  const saveContext = async () => {
    if (!patientId) return;
    setSaving(true);
    try {
      await fetch("/api/patient-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, ...contextForm }),
      });
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  }

  if (!brief || !brief.patient) {
    return (
      <div className="text-center py-16">
        <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Select a patient to view their brief. Add ?patientId=... to the URL or navigate from the patients page.</p>
      </div>
    );
  }

  const MoodIcon = brief.wellnessSnapshot.moodTrend === "improving" ? TrendingUp
    : brief.wellnessSnapshot.moodTrend === "declining" ? TrendingDown : Minus;

  const moodColor = brief.wellnessSnapshot.moodTrend === "improving" ? "text-green-600"
    : brief.wellnessSnapshot.moodTrend === "declining" ? "text-red-600" : "text-gray-500";

  const TagList = ({ items, field, color }: { items: string[]; field: string; color: string }) => (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
          {item}
          {editMode && (
            <button onClick={() => removeItem(field, i)} className="ml-1 text-red-400 hover:text-red-600">&times;</button>
          )}
        </span>
      ))}
      {editMode && (
        <button
          onClick={() => setNewItem({ field, value: "" })}
          className="inline-flex items-center px-2 py-1 rounded-full text-xs border border-dashed border-gray-300 text-gray-400 hover:border-primary-400 hover:text-primary-600"
        >
          <Plus className="w-3 h-3 mr-1" /> Add
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 gradient-bg rounded-full flex items-center justify-center text-white text-xl font-bold">
            {brief.patient.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{brief.patient.name}</h1>
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <span>{brief.patient.email}</span>
              {brief.patient.phone && <span>&middot; {brief.patient.phone}</span>}
              <span>&middot; Member since {new Date(brief.patient.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {saved && (
            <span className="flex items-center text-green-600 text-sm"><CheckCircle className="w-4 h-4 mr-1" /> Saved</span>
          )}
          {editMode ? (
            <>
              <Button variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button onClick={saveContext} loading={saving}><Save className="w-4 h-4 mr-2" /> Save Context</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setEditMode(true)}>Edit Context</Button>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      {brief.sessionHistory.daysSinceLastSession !== null && brief.sessionHistory.daysSinceLastSession > 14 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              It&apos;s been {brief.sessionHistory.daysSinceLastSession} days since the last session with this patient.
            </p>
            <p className="text-xs text-yellow-600 mt-1">Consider starting with a check-in about what&apos;s happened since you last met.</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-600" />
          <p className="text-2xl font-bold text-gray-900">{brief.sessionHistory.totalSessions}</p>
          <p className="text-xs text-gray-500">Total Sessions</p>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="w-5 h-5 mx-auto mb-1 text-orange-600" />
          <p className="text-2xl font-bold text-gray-900">{brief.sessionHistory.daysSinceLastSession ?? "—"}</p>
          <p className="text-xs text-gray-500">Days Since Last</p>
        </Card>
        <Card className="p-4 text-center">
          <Activity className="w-5 h-5 mx-auto mb-1 text-purple-600" />
          <p className="text-2xl font-bold text-gray-900">{brief.wellnessSnapshot.avgMood ?? "—"}%</p>
          <p className="text-xs text-gray-500">Avg Mood</p>
        </Card>
        <Card className="p-4 text-center">
          <MoodIcon className={`w-5 h-5 mx-auto mb-1 ${moodColor}`} />
          <p className={`text-lg font-bold capitalize ${moodColor}`}>{brief.wellnessSnapshot.moodTrend}</p>
          <p className="text-xs text-gray-500">Mood Trend</p>
        </Card>
        <Card className="p-4 text-center">
          <BookOpen className="w-5 h-5 mx-auto mb-1 text-green-600" />
          <p className="text-2xl font-bold text-gray-900">{brief.activePrograms.length}</p>
          <p className="text-xs text-gray-500">Active Programs</p>
        </Card>
      </div>

      {/* Add item modal */}
      {newItem.field && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-96">
            <h3 className="font-semibold text-gray-900 mb-3">Add {newItem.field.replace(/([A-Z])/g, " $1").trim()}</h3>
            <input
              type="text"
              value={newItem.value}
              onChange={(e) => setNewItem((p) => ({ ...p, value: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addItem(newItem.field)}
              placeholder="Type and press Enter..."
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 mb-3"
              autoFocus
            />
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={() => setNewItem({ field: "", value: "" })} className="flex-1">Cancel</Button>
              <Button onClick={() => addItem(newItem.field)} className="flex-1">Add</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Context */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary-600" /> Patient Summary
            </h2>
            {editMode ? (
              <textarea
                rows={4}
                value={contextForm.summary}
                onChange={(e) => setContextForm((p) => ({ ...p, summary: e.target.value }))}
                placeholder="Write a running summary of this patient's journey, key observations, and treatment approach..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed">
                {contextForm.summary || brief.context?.summary || "No summary yet. Click 'Edit Context' to add one."}
              </p>
            )}
          </Card>

          {/* Key Topics & Triggers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-blue-600" /> Key Topics
              </h3>
              <TagList items={contextForm.keyTopics} field="keyTopics" color="bg-blue-100 text-blue-700" />
              {contextForm.keyTopics.length === 0 && !editMode && <p className="text-xs text-gray-400">No topics tracked yet</p>}
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-600" /> Known Triggers
              </h3>
              <TagList items={contextForm.triggers} field="triggers" color="bg-red-100 text-red-700" />
              {contextForm.triggers.length === 0 && !editMode && <p className="text-xs text-gray-400">No triggers identified</p>}
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Heart className="w-4 h-4 mr-2 text-green-600" /> Coping Tools That Work
              </h3>
              <TagList items={contextForm.copingTools} field="copingTools" color="bg-green-100 text-green-700" />
              {contextForm.copingTools.length === 0 && !editMode && <p className="text-xs text-gray-400">No coping tools recorded</p>}
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-purple-600" /> Life Events
              </h3>
              <TagList items={contextForm.lifeEvents} field="lifeEvents" color="bg-purple-100 text-purple-700" />
              {contextForm.lifeEvents.length === 0 && !editMode && <p className="text-xs text-gray-400">No life events noted</p>}
            </Card>
          </div>

          {/* Recent Session Notes */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" /> Recent Session Notes
            </h2>
            {brief.recentNotes.length === 0 ? (
              <p className="text-sm text-gray-400">No session notes yet</p>
            ) : (
              <div className="space-y-4">
                {brief.recentNotes.map((note, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 mb-2">{new Date(note.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-700">{note.content}</p>
                    {note.mood && <p className="text-xs text-gray-500 mt-2"><strong>Mood:</strong> {note.mood}</p>}
                    {note.progress && <p className="text-xs text-gray-500"><strong>Progress:</strong> {note.progress}</p>}
                    {note.homework && <p className="text-xs text-primary-600"><strong>Homework:</strong> {note.homework}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - AI Insights & Programs */}
        <div className="space-y-6">
          {/* AI Insights */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-secondary-600" /> AI Insights
            </h2>
            <p className="text-xs text-gray-400 mb-3">Themes detected from patient&apos;s AI chat sessions</p>
            {brief.aiInsights.memories.length > 0 ? (
              <div className="space-y-2">
                {brief.aiInsights.memories.map((mem, i) => (
                  <div key={i} className="flex items-center space-x-2 p-2 bg-secondary-50 rounded-lg">
                    <Badge variant={mem.category === "TOPIC" ? "info" : mem.category === "EVENT" ? "warning" : "success"}>
                      {mem.category}
                    </Badge>
                    <span className="text-xs text-gray-700">{mem.content}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No AI insights available yet</p>
            )}

            {brief.aiInsights.recentChatThemes.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Recent Chat Messages</p>
                {brief.aiInsights.recentChatThemes.slice(0, 3).map((theme, i) => (
                  <p key={i} className="text-xs text-gray-500 italic p-2 bg-gray-50 rounded-lg mb-1 truncate">
                    &ldquo;{theme}&rdquo;
                  </p>
                ))}
              </div>
            )}
          </Card>

          {/* Active Programs */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-green-600" /> Active Programs
            </h2>
            {brief.activePrograms.length === 0 ? (
              <p className="text-xs text-gray-400">Not enrolled in any programs</p>
            ) : (
              <div className="space-y-3">
                {brief.activePrograms.map((prog, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-900">{prog.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge>{prog.category}</Badge>
                      <span className="text-xs text-gray-500">{Math.round(prog.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${prog.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Appointments */}
          {brief.upcomingAppointments.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Sessions</h2>
              {brief.upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg text-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">
                    {new Date(apt.dateTime).toLocaleDateString()} at{" "}
                    {new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </Card>
          )}

          {/* Patient Last Active */}
          {brief.patient.lastLoginAt && (
            <Card className="p-4">
              <p className="text-xs text-gray-500">
                Patient last active: {new Date(brief.patient.lastLoginAt).toLocaleDateString()}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PatientBriefPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>}>
      <PatientBriefContent />
    </Suspense>
  );
}
