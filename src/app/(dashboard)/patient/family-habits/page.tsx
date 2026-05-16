"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  CheckCircle, Circle, Plus, Target, Heart, Flame,
  Calendar, Trophy, Users, ArrowRight, Send,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Tooltip from "@/components/ui/tooltip";
import { useToast } from "@/components/providers/toast-provider";

interface Habit { id: string; name: string; icon: string; frequency: string; streak: number; todayDone: boolean }
interface Goal { id: string; title: string; description: string | null; category: string; targetValue: number | null; currentValue: number; unit: string | null; deadline: string | null; status: string }
interface Gratitude { id: string; message: string; date: string; fromUser: { name: string }; toUser: { name: string } }
interface FamilyMember { id: string; user: { id: string; name: string } }

export default function FamilyHabitsPage() {
  const { status } = useSession();
  const toast = useToast();
  const [tab, setTab] = useState<"habits" | "goals" | "gratitude">("habits");
  const [familyGroupId, setFamilyGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [gratitudes, setGratitudes] = useState<Gratitude[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showNewHabit, setShowNewHabit] = useState(false);
  const [habitForm, setHabitForm] = useState({ name: "", icon: "✅" });
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: "", description: "", category: "HEALTH", targetValue: "", unit: "days", deadline: "" });
  const [gratForm, setGratForm] = useState({ toUserId: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    // Get family group
    fetch("/api/family").then((r) => r.json()).then((data) => {
      if (data?.id) {
        setFamilyGroupId(data.id);
        setMembers(data.members || []);
        fetchData(data.id);
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, [status]);

  const fetchData = (fgId: string) => {
    Promise.all([
      fetch(`/api/family/wellness?section=habits&familyGroupId=${fgId}`).then((r) => r.json()),
      fetch(`/api/family/wellness?section=goals&familyGroupId=${fgId}`).then((r) => r.json()),
      fetch(`/api/family/wellness?section=gratitude&familyGroupId=${fgId}`).then((r) => r.json()),
    ]).then(([h, g, gr]) => {
      if (Array.isArray(h)) setHabits(h);
      if (Array.isArray(g)) setGoals(g);
      if (Array.isArray(gr)) setGratitudes(gr);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const post = async (action: string, data: Record<string, unknown>) => {
    setSubmitting(true);
    const res = await fetch("/api/family/wellness", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, familyGroupId, ...data }) });
    setSubmitting(false);
    return res.ok ? res.json() : null;
  };

  const createHabit = async () => {
    if (!habitForm.name.trim()) return;
    await post("createHabit", habitForm);
    toast.success("Habit added for the family!");
    setHabitForm({ name: "", icon: "✅" });
    setShowNewHabit(false);
    if (familyGroupId) fetchData(familyGroupId);
  };

  const logHabit = async (habitId: string) => {
    await post("logHabit", { habitId });
    toast.success("Done! Streak growing 🔥");
    if (familyGroupId) fetchData(familyGroupId);
  };

  const createGoal = async () => {
    if (!goalForm.title.trim()) return;
    await post("createGoal", goalForm);
    toast.success("Family goal created!");
    setGoalForm({ title: "", description: "", category: "HEALTH", targetValue: "", unit: "days", deadline: "" });
    setShowNewGoal(false);
    if (familyGroupId) fetchData(familyGroupId);
  };

  const incrementGoal = async (goalId: string, currentValue: number) => {
    await post("updateGoal", { goalId, currentValue: currentValue + 1 });
    if (familyGroupId) fetchData(familyGroupId);
  };

  const sendGratitude = async () => {
    if (!gratForm.toUserId || !gratForm.message.trim()) { toast.warning("Select someone and write a message"); return; }
    await post("sendGratitude", gratForm);
    toast.success("Gratitude sent! 💛");
    setGratForm({ toUserId: "", message: "" });
    if (familyGroupId) fetchData(familyGroupId);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  if (!familyGroupId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Family Habits & Goals</h1>
        <p className="text-gray-500 mt-3 max-w-md mx-auto">Set up your family group first to use shared habits, goals, and the gratitude circle.</p>
        <Button className="mt-5" onClick={() => window.location.assign("/patient/family")}>Set Up Family <ArrowRight className="w-4 h-4 ml-2" /></Button>
      </div>
    );
  }

  const HABIT_ICONS = ["✅", "🧘", "🏃", "💊", "📖", "🧹", "💤", "🥗", "🚰", "📵", "🎯", "🙏"];
  const GOAL_CATEGORIES = ["HEALTH", "FITNESS", "NUTRITION", "SCREEN_TIME", "RELATIONSHIP", "EDUCATION", "SAVINGS"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            Family Wellness
            <Tooltip maxWidth={340} content="Build daily habits as a family, set shared goals, and express daily gratitude. Streaks keep everyone motivated. When the whole family sees each other's progress, accountability becomes natural." />
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Habits + Goals + Gratitude — the daily routine that keeps your family thriving.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl max-w-md">
        {([["habits", "🔥 Habits"], ["goals", "🎯 Goals"], ["gratitude", "💛 Gratitude"]] as [string, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as typeof tab)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium ${tab === key ? "bg-white dark:bg-gray-700 shadow-sm text-primary-700" : "text-gray-500"}`}>{label}</button>
        ))}
      </div>

      {/* HABITS TAB */}
      {tab === "habits" && (
        <div className="space-y-4">
          {habits.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Today&apos;s habits</h3>
                <p className="text-sm text-gray-500">{habits.filter((h) => h.todayDone).length}/{habits.length} done</p>
              </div>
              <div className="space-y-3">
                {habits.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <button onClick={() => !h.todayDone && logHabit(h.id)} className="flex-shrink-0">
                        {h.todayDone ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-gray-300 hover:text-primary-500 transition-colors" />}
                      </button>
                      <span className="text-lg">{h.icon}</span>
                      <span className={`font-medium ${h.todayDone ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"}`}>{h.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {h.streak > 0 && (
                        <Badge variant="warning" className="flex items-center"><Flame className="w-3 h-3 mr-1" />{h.streak}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {showNewHabit ? (
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">New family habit</h3>
              <input type="text" placeholder="e.g. 30 minutes exercise, No screens after 9pm" value={habitForm.name} onChange={(e) => setHabitForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              <div className="flex flex-wrap gap-2">
                {HABIT_ICONS.map((icon) => (
                  <button key={icon} onClick={() => setHabitForm((p) => ({ ...p, icon }))}
                    className={`text-2xl p-2 rounded-lg ${habitForm.icon === icon ? "bg-primary-100 ring-2 ring-primary-500" : "hover:bg-gray-100"}`}>{icon}</button>
                ))}
              </div>
              <div className="flex gap-2"><Button onClick={createHabit} loading={submitting}>Create Habit</Button><Button variant="outline" onClick={() => setShowNewHabit(false)}>Cancel</Button></div>
            </Card>
          ) : (
            <Button variant="outline" onClick={() => setShowNewHabit(true)}><Plus className="w-4 h-4 mr-2" /> Add Family Habit</Button>
          )}

          {habits.length === 0 && !showNewHabit && (
            <Card className="p-10 text-center bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950">
              <Flame className="w-12 h-12 text-orange-400 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Start your first family habit</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto mb-4">Try "Eat dinner together" or "10 minutes reading before bed". Check them off daily and watch streaks build.</p>
              <Button onClick={() => setShowNewHabit(true)}><Plus className="w-4 h-4 mr-2" /> Create First Habit</Button>
            </Card>
          )}
        </div>
      )}

      {/* GOALS TAB */}
      {tab === "goals" && (
        <div className="space-y-4">
          {goals.filter((g) => g.status === "ACTIVE").map((g) => {
            const pct = g.targetValue ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0;
            return (
              <Card key={g.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{g.title}</h3>
                    {g.description && <p className="text-sm text-gray-500 mt-0.5">{g.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{g.category}</Badge>
                    {g.deadline && <span className="text-xs text-gray-400"><Calendar className="w-3 h-3 inline mr-1" />{new Date(g.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>
                {g.targetValue && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{g.currentValue} / {g.targetValue} {g.unit}</span>
                      <span className="font-bold text-primary-600">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="gradient-bg h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
                <Button size="sm" variant="outline" onClick={() => incrementGoal(g.id, g.currentValue)}>
                  <Plus className="w-3 h-3 mr-1" /> +1 {g.unit || ""}
                </Button>
              </Card>
            );
          })}

          {goals.filter((g) => g.status === "COMPLETED").length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Completed</p>
              {goals.filter((g) => g.status === "COMPLETED").map((g) => (
                <div key={g.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-xl mb-2">
                  <span className="flex items-center text-sm font-medium text-green-700 dark:text-green-300"><Trophy className="w-4 h-4 mr-2" />{g.title}</span>
                  <Badge variant="success">Done!</Badge>
                </div>
              ))}
            </div>
          )}

          {showNewGoal ? (
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">New family goal</h3>
              <input type="text" placeholder="e.g. No screens at dinner for 30 days" value={goalForm.title} onChange={(e) => setGoalForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              <textarea rows={2} placeholder="Why this goal matters (optional)" value={goalForm.description} onChange={(e) => setGoalForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none" />
              <div className="grid grid-cols-3 gap-3">
                <select value={goalForm.category} onChange={(e) => setGoalForm((p) => ({ ...p, category: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">{GOAL_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}</select>
                <input type="number" placeholder="Target" value={goalForm.targetValue} onChange={(e) => setGoalForm((p) => ({ ...p, targetValue: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
                <input type="date" value={goalForm.deadline} onChange={(e) => setGoalForm((p) => ({ ...p, deadline: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              </div>
              <div className="flex gap-2"><Button onClick={createGoal} loading={submitting}>Create Goal</Button><Button variant="outline" onClick={() => setShowNewGoal(false)}>Cancel</Button></div>
            </Card>
          ) : (
            <Button variant="outline" onClick={() => setShowNewGoal(true)}><Plus className="w-4 h-4 mr-2" /> Add Family Goal</Button>
          )}

          {goals.length === 0 && !showNewGoal && (
            <Card className="p-10 text-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
              <Target className="w-12 h-12 text-primary-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Set your first family goal</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto mb-4">Try "Family walk 3 times this week" or "Cook together every Sunday". Track progress together.</p>
              <Button onClick={() => setShowNewGoal(true)}><Plus className="w-4 h-4 mr-2" /> Create First Goal</Button>
            </Card>
          )}
        </div>
      )}

      {/* GRATITUDE TAB */}
      {tab === "gratitude" && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center"><Heart className="w-4 h-4 mr-2 text-pink-500" /> Express gratitude</h3>
            <p className="text-sm text-gray-500 mb-4">One thing you appreciate about a family member today.</p>
            <div className="space-y-3">
              <select value={gratForm.toUserId} onChange={(e) => setGratForm((p) => ({ ...p, toUserId: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <option value="">Who are you grateful for?</option>
                {members.map((m) => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
              </select>
              <input type="text" placeholder="e.g. Thanks for making dinner tonight" value={gratForm.message} onChange={(e) => setGratForm((p) => ({ ...p, message: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              <Button onClick={sendGratitude} loading={submitting}><Send className="w-4 h-4 mr-2" /> Send Gratitude</Button>
            </div>
          </Card>

          {gratitudes.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Recent gratitude</p>
              {gratitudes.map((g) => (
                <Card key={g.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <Heart className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white"><strong>{g.fromUser.name}</strong> → <strong>{g.toUser.name}</strong></p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">&ldquo;{g.message}&rdquo;</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(g.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950">
              <Heart className="w-12 h-12 text-pink-400 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Start the gratitude circle</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto">Express one small thing you appreciate about a family member above. They will see it on their dashboard. This builds connection stronger than any other single habit.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
