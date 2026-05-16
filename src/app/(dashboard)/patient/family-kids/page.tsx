"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Baby, Plus, TrendingUp, Utensils, Moon, Smile,
  Award, Heart, Ruler, Weight, Droplets, Star,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Tooltip from "@/components/ui/tooltip";
import { useToast } from "@/components/providers/toast-provider";

interface Child {
  id: string; name: string; dateOfBirth: string; gender: string | null;
  allergies: string; conditions: string; school: string | null; grade: string | null;
  growthLogs: { height: number | null; weight: number | null; date: string }[];
  moodLogs: { mood: string; energy: number | null; date: string; notes: string | null }[];
  foodLogs: { mealType: string; items: string; category: string | null; date: string }[];
  sleepLogs: { bedtime: string; wakeTime: string; quality: number | null; date: string }[];
  milestones: { title: string; category: string; date: string; notes: string | null }[];
}

const MOODS = ["😄", "😊", "😐", "😢", "😡", "😰"];
const MEALS = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
const FOOD_CATS = [
  { id: "HEALTHY", label: "Healthy", color: "bg-green-100 text-green-700" },
  { id: "MIXED", label: "Mixed", color: "bg-yellow-100 text-yellow-700" },
  { id: "JUNK", label: "Junk", color: "bg-red-100 text-red-700" },
];

export default function FamilyKidsPage() {
  const { status } = useSession();
  const toast = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [tab, setTab] = useState<"overview" | "mood" | "food" | "sleep" | "growth" | "milestones">("overview");
  const [showAddChild, setShowAddChild] = useState(false);

  // Forms
  const [childForm, setChildForm] = useState({ name: "", dateOfBirth: "", gender: "", school: "", grade: "" });
  const [moodForm, setMoodForm] = useState({ mood: "😊", energy: "3", notes: "" });
  const [foodForm, setFoodForm] = useState({ mealType: "BREAKFAST", items: "", category: "HEALTHY", notes: "" });
  const [sleepForm, setSleepForm] = useState({ bedtime: "21:00", wakeTime: "07:00", quality: "4", notes: "" });
  const [growthForm, setGrowthForm] = useState({ height: "", weight: "", notes: "" });
  const [milestoneForm, setMilestoneForm] = useState({ title: "", category: "PHYSICAL", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchChildren = () => {
    fetch("/api/family/kids").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setChildren(d); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { if (status === "authenticated") fetchChildren(); }, [status]);

  const post = async (action: string, data: Record<string, unknown>) => {
    setSubmitting(true);
    const res = await fetch("/api/family/kids", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...data }) });
    setSubmitting(false);
    if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed"); return null; }
    return res.json();
  };

  const addChild = async () => {
    if (!childForm.name || !childForm.dateOfBirth) { toast.warning("Name and date of birth required"); return; }
    await post("addChild", childForm);
    toast.success(`${childForm.name} added!`);
    setChildForm({ name: "", dateOfBirth: "", gender: "", school: "", grade: "" });
    setShowAddChild(false);
    fetchChildren();
  };

  const logMood = async () => {
    if (!selectedChild) return;
    await post("logMood", { childId: selectedChild.id, ...moodForm });
    toast.success("Mood logged");
    fetchChildren();
  };

  const logFood = async () => {
    if (!selectedChild || !foodForm.items.trim()) return;
    await post("logFood", { childId: selectedChild.id, ...foodForm, items: foodForm.items.split(",").map((i) => i.trim()) });
    toast.success("Meal logged");
    setFoodForm({ mealType: "BREAKFAST", items: "", category: "HEALTHY", notes: "" });
    fetchChildren();
  };

  const logSleep = async () => {
    if (!selectedChild) return;
    await post("logSleep", { childId: selectedChild.id, ...sleepForm });
    toast.success("Sleep logged");
    fetchChildren();
  };

  const logGrowth = async () => {
    if (!selectedChild) return;
    await post("logGrowth", { childId: selectedChild.id, ...growthForm });
    toast.success("Growth recorded");
    setGrowthForm({ height: "", weight: "", notes: "" });
    fetchChildren();
  };

  const addMilestone = async () => {
    if (!selectedChild || !milestoneForm.title.trim()) return;
    await post("addMilestone", { childId: selectedChild.id, ...milestoneForm });
    toast.success("Milestone added! 🎉");
    setMilestoneForm({ title: "", category: "PHYSICAL", notes: "" });
    fetchChildren();
  };

  const getAge = (dob: string) => {
    const d = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - d.getFullYear();
    const months = now.getMonth() - d.getMonth();
    if (years < 1) return `${Math.max(0, years * 12 + months)} months`;
    if (years < 3) return `${years}y ${months >= 0 ? months : 12 + months}m`;
    return `${years} years`;
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  // No children yet
  if (children.length === 0 && !showAddChild) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-pink-100 dark:bg-pink-950 rounded-full flex items-center justify-center mx-auto mb-5">
            <Baby className="w-10 h-10 text-pink-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Kids Health Tracker</h1>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">Track your children&apos;s growth, mood, nutrition, sleep, and milestones — all in one place. Watch them thrive over months and years.</p>
        </div>
        <Card className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">Add your first child to get started.</p>
          <Button onClick={() => setShowAddChild(true)}><Plus className="w-4 h-4 mr-2" /> Add Child</Button>
        </Card>
      </div>
    );
  }

  // Add child form
  if (showAddChild) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add a Child</h1>
        <Card className="p-6 space-y-4">
          <input type="text" placeholder="Child's name" value={childForm.name} onChange={(e) => setChildForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
          <input type="date" value={childForm.dateOfBirth} onChange={(e) => setChildForm((p) => ({ ...p, dateOfBirth: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
          <select value={childForm.gender} onChange={(e) => setChildForm((p) => ({ ...p, gender: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <option value="">Gender (optional)</option><option value="MALE">Boy</option><option value="FEMALE">Girl</option><option value="OTHER">Other</option>
          </select>
          <input type="text" placeholder="School (optional)" value={childForm.school} onChange={(e) => setChildForm((p) => ({ ...p, school: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
          <input type="text" placeholder="Grade/Class (optional)" value={childForm.grade} onChange={(e) => setChildForm((p) => ({ ...p, grade: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
          <div className="flex gap-2">
            <Button onClick={addChild} loading={submitting}>Add Child</Button>
            <Button variant="outline" onClick={() => setShowAddChild(false)}>Cancel</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Main view with selected child
  const child = selectedChild || children[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            Kids Health
            <Tooltip maxWidth={340} content="Track your children's growth, nutrition, mood, sleep, and milestones over time. Data is only visible to parents in this family. Kids' data is never shared with employers, therapists, or community." />
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Daily tracking builds a picture of how your children are growing and feeling.</p>
        </div>
        <Button variant="outline" onClick={() => setShowAddChild(true)}><Plus className="w-4 h-4 mr-2" /> Add Child</Button>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {children.map((c) => (
            <button key={c.id} onClick={() => { setSelectedChild(c); setTab("overview"); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${child.id === c.id ? "gradient-bg text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"}`}>
              {c.name} ({getAge(c.dateOfBirth)})
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {([["overview", "Overview"], ["mood", "😊 Mood"], ["food", "🍎 Food"], ["sleep", "😴 Sleep"], ["growth", "📏 Growth"], ["milestones", "🏆 Milestones"]] as [string, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as typeof tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? "bg-white dark:bg-gray-700 shadow-sm text-primary-700" : "text-gray-500"}`}>{label}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-white text-2xl font-bold">{child.name[0]}</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{child.name}</h2>
                <p className="text-sm text-gray-500">{getAge(child.dateOfBirth)} old {child.school ? `• ${child.school}` : ""} {child.grade ? `(${child.grade})` : ""}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-pink-50 dark:bg-pink-950 rounded-xl text-center">
                <Smile className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{child.moodLogs[0]?.mood || "—"}</p>
                <p className="text-xs text-gray-500">Today&apos;s mood</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-xl text-center">
                <Utensils className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{child.foodLogs.length}</p>
                <p className="text-xs text-gray-500">Meals today</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-xl text-center">
                <Moon className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{child.sleepLogs[0]?.quality ? `${child.sleepLogs[0].quality}/5` : "—"}</p>
                <p className="text-xs text-gray-500">Last sleep</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-xl text-center">
                <TrendingUp className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{child.growthLogs[0]?.weight ? `${child.growthLogs[0].weight}kg` : "—"}</p>
                <p className="text-xs text-gray-500">Last weight</p>
              </div>
            </div>
          </Card>
          {child.milestones.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center"><Award className="w-4 h-4 mr-2 text-yellow-500" /> Recent milestones</h3>
              <div className="space-y-2">
                {child.milestones.slice(0, 3).map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-xl">
                    <div className="flex items-center space-x-3"><Star className="w-4 h-4 text-yellow-500" /><span className="text-sm font-medium text-gray-900 dark:text-white">{m.title}</span></div>
                    <span className="text-xs text-gray-400">{new Date(m.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Mood tab */}
      {tab === "mood" && (
        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-gray-900 dark:text-white">How is {child.name} feeling today?</h3>
          <div className="flex gap-3 flex-wrap">
            {MOODS.map((m) => (
              <button key={m} onClick={() => setMoodForm((p) => ({ ...p, mood: m }))}
                className={`text-3xl p-3 rounded-xl transition-all ${moodForm.mood === m ? "bg-primary-100 dark:bg-primary-900 scale-110 ring-2 ring-primary-500" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{m}</button>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">Energy:</span>
            {[1, 2, 3, 4, 5].map((e) => (
              <button key={e} onClick={() => setMoodForm((p) => ({ ...p, energy: String(e) }))}
                className={`w-8 h-8 rounded-full text-sm font-bold ${parseInt(moodForm.energy) >= e ? "gradient-bg text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>{e}</button>
            ))}
          </div>
          <input type="text" placeholder="Any notes? (optional)" value={moodForm.notes} onChange={(e) => setMoodForm((p) => ({ ...p, notes: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
          <Button onClick={logMood} loading={submitting}>Log Mood</Button>
          {child.moodLogs.length > 0 && (
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-widest">This week</p>
              <div className="flex gap-2">{child.moodLogs.slice(0, 7).map((m, i) => (<span key={i} className="text-2xl" title={new Date(m.date).toLocaleDateString()}>{m.mood}</span>))}</div>
            </div>
          )}
        </Card>
      )}

      {/* Food tab */}
      {tab === "food" && (
        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-gray-900 dark:text-white">What did {child.name} eat?</h3>
          <div className="flex gap-2 flex-wrap">
            {MEALS.map((m) => (
              <button key={m} onClick={() => setFoodForm((p) => ({ ...p, mealType: m }))}
                className={`px-4 py-2 rounded-full text-sm font-medium ${foodForm.mealType === m ? "gradient-bg text-white" : "bg-gray-100 text-gray-600"}`}>{m.charAt(0) + m.slice(1).toLowerCase()}</button>
            ))}
          </div>
          <input type="text" placeholder="What items? (comma separated: rice, dal, apple)" value={foodForm.items} onChange={(e) => setFoodForm((p) => ({ ...p, items: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
          <div className="flex gap-2">
            {FOOD_CATS.map((c) => (
              <button key={c.id} onClick={() => setFoodForm((p) => ({ ...p, category: c.id }))}
                className={`px-4 py-2 rounded-full text-sm font-medium ${foodForm.category === c.id ? c.color + " ring-2 ring-offset-1" : "bg-gray-100 text-gray-600"}`}>{c.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">Water cups today:</span>
            <input type="number" min="0" max="15" placeholder="0" className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-center" />
          </div>
          <Button onClick={logFood} loading={submitting}>Log Meal</Button>
          {child.foodLogs.length > 0 && (
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Today&apos;s meals</p>
              {child.foodLogs.map((f, i) => {
                const items: string[] = (() => { try { return JSON.parse(f.items); } catch { return []; } })();
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div><Badge>{f.mealType}</Badge> <span className="text-sm text-gray-600 ml-2">{items.join(", ")}</span></div>
                    {f.category && <Badge className={FOOD_CATS.find((c) => c.id === f.category)?.color || ""}>{f.category}</Badge>}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Sleep tab */}
      {tab === "sleep" && (
        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-gray-900 dark:text-white">{child.name}&apos;s sleep last night</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm text-gray-600 mb-1 block">Bedtime</label><input type="time" value={sleepForm.bedtime} onChange={(e) => setSleepForm((p) => ({ ...p, bedtime: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" /></div>
            <div><label className="text-sm text-gray-600 mb-1 block">Wake time</label><input type="time" value={sleepForm.wakeTime} onChange={(e) => setSleepForm((p) => ({ ...p, wakeTime: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" /></div>
          </div>
          <div><label className="text-sm text-gray-600 mb-1 block">Sleep quality</label><div className="flex gap-2">{[1, 2, 3, 4, 5].map((q) => (<button key={q} onClick={() => setSleepForm((p) => ({ ...p, quality: String(q) }))} className={`w-10 h-10 rounded-xl text-sm font-bold ${parseInt(sleepForm.quality) >= q ? "gradient-bg text-white" : "bg-gray-100 text-gray-500"}`}>{q}</button>))}</div></div>
          <Button onClick={logSleep} loading={submitting}>Log Sleep</Button>
          {child.sleepLogs.length > 0 && (
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Last 7 nights</p>
              {child.sleepLogs.slice(0, 7).map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 text-sm">
                  <span className="text-gray-500">{new Date(s.date).toLocaleDateString(undefined, { weekday: "short" })}</span>
                  <span className="text-gray-900 dark:text-white">{s.bedtime} → {s.wakeTime}</span>
                  <Badge variant={s.quality && s.quality >= 4 ? "success" : s.quality && s.quality >= 3 ? "warning" : "danger"}>{s.quality}/5</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Growth tab */}
      {tab === "growth" && (
        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center"><Ruler className="w-4 h-4 mr-2" /> Log growth for {child.name}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm text-gray-600 mb-1 block">Height (cm)</label><input type="number" step="0.1" value={growthForm.height} onChange={(e) => setGrowthForm((p) => ({ ...p, height: e.target.value }))} placeholder="e.g. 95.5" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" /></div>
            <div><label className="text-sm text-gray-600 mb-1 block">Weight (kg)</label><input type="number" step="0.1" value={growthForm.weight} onChange={(e) => setGrowthForm((p) => ({ ...p, weight: e.target.value }))} placeholder="e.g. 14.2" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" /></div>
          </div>
          <Button onClick={logGrowth} loading={submitting}>Save Measurement</Button>
          {child.growthLogs.length > 0 && (
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Growth history</p>
              {child.growthLogs.map((g, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm">
                  <span className="text-gray-500">{new Date(g.date).toLocaleDateString()}</span>
                  <div className="flex gap-4">
                    {g.height && <span className="flex items-center"><Ruler className="w-3 h-3 mr-1 text-blue-500" />{g.height} cm</span>}
                    {g.weight && <span className="flex items-center"><Weight className="w-3 h-3 mr-1 text-green-500" />{g.weight} kg</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Milestones tab */}
      {tab === "milestones" && (
        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center"><Award className="w-4 h-4 mr-2 text-yellow-500" /> Milestones for {child.name}</h3>
          <div className="flex gap-2 flex-wrap">
            <input type="text" placeholder="What milestone? (e.g. First steps, Lost first tooth)" value={milestoneForm.title} onChange={(e) => setMilestoneForm((p) => ({ ...p, title: e.target.value }))} className="flex-1 min-w-[200px] px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            <select value={milestoneForm.category} onChange={(e) => setMilestoneForm((p) => ({ ...p, category: e.target.value }))} className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="PHYSICAL">Physical</option><option value="COGNITIVE">Cognitive</option><option value="SOCIAL">Social</option><option value="ACADEMIC">Academic</option><option value="HEALTH">Health</option>
            </select>
            <Button onClick={addMilestone} loading={submitting}>Add</Button>
          </div>
          <div className="space-y-2">
            {child.milestones.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950 rounded-xl">
                <div className="flex items-center space-x-3"><Star className="w-5 h-5 text-yellow-500" /><div><p className="font-medium text-gray-900 dark:text-white">{m.title}</p>{m.notes && <p className="text-xs text-gray-500">{m.notes}</p>}</div></div>
                <div className="text-right"><Badge>{m.category}</Badge><p className="text-xs text-gray-400 mt-1">{new Date(m.date).toLocaleDateString()}</p></div>
              </div>
            ))}
            {child.milestones.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No milestones recorded yet. Add the first one above!</p>}
          </div>
        </Card>
      )}
    </div>
  );
}
