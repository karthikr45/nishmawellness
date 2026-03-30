"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen, Plus, Smile, Frown, Meh, Zap, Moon,
  Heart, AlertTriangle, PenLine, Calendar, Star,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface JournalEntry {
  id: string;
  mood: number;
  energy: number;
  anxiety: number;
  sleep: number;
  gratitude: string;
  highlight: string;
  challenge: string;
  freeWrite: string;
  tags: string;
  date: string;
}

const moodEmoji = (val: number) => val >= 8 ? "😄" : val >= 6 ? "🙂" : val >= 4 ? "😐" : val >= 2 ? "😔" : "😢";

export default function PatientJournal() {
  const { status } = useSession();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    mood: 7, energy: 6, anxiety: 3, sleep: 7,
    gratitude: "", highlight: "", challenge: "", freeWrite: "", tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/journal").then((r) => r.json()).then(setEntries).catch(console.error);
    }
  }, [status]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const entry = await res.json();
      setEntries((prev) => [entry, ...prev]);
      setShowForm(false);
      setForm({ mood: 7, energy: 6, anxiety: 3, sleep: 7, gratitude: "", highlight: "", challenge: "", freeWrite: "", tags: [] });
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const SliderInput = ({ label, icon, value, onChange, color }: { label: string; icon: React.ReactNode; value: number; onChange: (v: number) => void; color: string }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 flex items-center">{icon}<span className="ml-2">{label}</span></span>
        <span className={`text-lg font-bold ${color}`}>{value}/10</span>
      </div>
      <input type="range" min="1" max="10" value={value} onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wellness Journal</h1>
          <p className="text-gray-500 mt-1">Daily check-ins to track your well-being</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> New Entry
        </Button>
      </div>

      {/* Weekly Summary */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Avg Mood", value: Math.round(entries.slice(0, 7).reduce((s, e) => s + e.mood, 0) / Math.min(entries.length, 7) * 10), icon: <Smile className="w-5 h-5" />, color: "bg-yellow-100 text-yellow-600" },
            { label: "Avg Energy", value: Math.round(entries.slice(0, 7).reduce((s, e) => s + e.energy, 0) / Math.min(entries.length, 7) * 10), icon: <Zap className="w-5 h-5" />, color: "bg-orange-100 text-orange-600" },
            { label: "Avg Sleep", value: Math.round(entries.slice(0, 7).reduce((s, e) => s + e.sleep, 0) / Math.min(entries.length, 7) * 10), icon: <Moon className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
            { label: "Entries", value: entries.length, icon: <BookOpen className="w-5 h-5" />, color: "bg-green-100 text-green-600" },
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{typeof stat.value === "number" && stat.label !== "Entries" ? `${stat.value}%` : stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Entry Form */}
      {showForm && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Check-In</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <SliderInput label="Mood" icon={<span className="text-lg">{moodEmoji(form.mood)}</span>} value={form.mood} onChange={(v) => setForm((p) => ({ ...p, mood: v }))} color="text-yellow-600" />
              <SliderInput label="Energy" icon={<Zap className="w-4 h-4 text-orange-500" />} value={form.energy} onChange={(v) => setForm((p) => ({ ...p, energy: v }))} color="text-orange-600" />
              <SliderInput label="Anxiety" icon={<AlertTriangle className="w-4 h-4 text-red-500" />} value={form.anxiety} onChange={(v) => setForm((p) => ({ ...p, anxiety: v }))} color="text-red-600" />
              <SliderInput label="Sleep Quality" icon={<Moon className="w-4 h-4 text-blue-500" />} value={form.sleep} onChange={(v) => setForm((p) => ({ ...p, sleep: v }))} color="text-blue-600" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Heart className="w-4 h-4 mr-1 text-pink-500" /> Gratitude</label>
                <input type="text" placeholder="What are you grateful for today?" value={form.gratitude}
                  onChange={(e) => setForm((p) => ({ ...p, gratitude: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-500" /> Highlight</label>
                <input type="text" placeholder="Best part of your day?" value={form.highlight}
                  onChange={(e) => setForm((p) => ({ ...p, highlight: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><AlertTriangle className="w-4 h-4 mr-1 text-orange-500" /> Challenge</label>
                <input type="text" placeholder="Biggest challenge today?" value={form.challenge}
                  onChange={(e) => setForm((p) => ({ ...p, challenge: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><PenLine className="w-4 h-4 mr-1" /> Free Write</label>
            <textarea rows={4} placeholder="Write freely about your thoughts and feelings..." value={form.freeWrite}
              onChange={(e) => setForm((p) => ({ ...p, freeWrite: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex items-center space-x-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add tag..." className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
              <Button size="sm" variant="outline" onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.tags.map((tag) => (
                <Badge key={tag}>{tag} <button className="ml-1" onClick={() => setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))}>&times;</button></Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={save} loading={saving}>Save Journal Entry</Button>
          </div>
        </Card>
      )}

      {/* Journal Entries */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{moodEmoji(entry.mood)}</span>
                <div>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    {new Date(entry.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                    <span>Mood: {entry.mood}/10</span>
                    <span>Energy: {entry.energy}/10</span>
                    <span>Anxiety: {entry.anxiety}/10</span>
                    <span>Sleep: {entry.sleep}/10</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {JSON.parse(entry.tags || "[]").map((tag: string) => (
                  <Badge key={tag} variant="default">{tag}</Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {entry.gratitude && <div className="p-3 bg-pink-50 rounded-xl"><p className="text-xs text-pink-600 font-medium mb-1">Gratitude</p><p className="text-gray-700">{entry.gratitude}</p></div>}
              {entry.highlight && <div className="p-3 bg-yellow-50 rounded-xl"><p className="text-xs text-yellow-600 font-medium mb-1">Highlight</p><p className="text-gray-700">{entry.highlight}</p></div>}
              {entry.challenge && <div className="p-3 bg-orange-50 rounded-xl"><p className="text-xs text-orange-600 font-medium mb-1">Challenge</p><p className="text-gray-700">{entry.challenge}</p></div>}
            </div>
            {entry.freeWrite && (
              <p className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-xl leading-relaxed">{entry.freeWrite}</p>
            )}
          </Card>
        ))}
      </div>

      {entries.length === 0 && !showForm && (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Start your wellness journal today</p>
          <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> Write First Entry</Button>
        </Card>
      )}
    </div>
  );
}
