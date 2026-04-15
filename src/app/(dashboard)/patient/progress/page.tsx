"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BarChart3, TrendingUp, Smile, Moon, Dumbbell, Brain } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Tooltip from "@/components/ui/tooltip";

interface ProgressRecord {
  id: string;
  type: string;
  value: number;
  note?: string;
  date: string;
}

export default function PatientProgress() {
  const { status } = useSession();
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [newEntry, setNewEntry] = useState({ type: "MOOD", value: "75", note: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/users/progress")
        .then((r) => r.json())
        .then(setProgress)
        .catch(console.error);
    }
  }, [status]);

  const saveProgress = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });
      const data = await res.json();
      setProgress((prev) => [...prev, data]);
      setNewEntry({ type: "MOOD", value: "75", note: "" });
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const typeIcons: Record<string, React.ReactNode> = {
    MOOD: <Smile className="w-5 h-5" />,
    SLEEP: <Moon className="w-5 h-5" />,
    EXERCISE: <Dumbbell className="w-5 h-5" />,
    MINDFULNESS: <Brain className="w-5 h-5" />,
  };

  const typeColors: Record<string, string> = {
    MOOD: "bg-yellow-100 text-yellow-600",
    SLEEP: "bg-blue-100 text-blue-600",
    EXERCISE: "bg-red-100 text-red-600",
    MINDFULNESS: "bg-purple-100 text-purple-600",
  };

  // Calculate averages for the last 7 days
  const last7Days = progress.filter(
    (p) => new Date(p.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  const averages = ["MOOD", "SLEEP", "EXERCISE", "MINDFULNESS"].map((type) => {
    const records = last7Days.filter((p) => p.type === type);
    const avg = records.length > 0
      ? Math.round(records.reduce((sum, r) => sum + r.value, 0) / records.length)
      : 0;
    return { type, avg, count: records.length };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          My Progress
          <Tooltip
            maxWidth={320}
            content="Long-term trend charts for mood, sleep, exercise, and mindfulness. Where Insights shows your current week at a glance, Progress shows patterns across weeks and months — useful for seeing whether things are genuinely improving."
          />
        </h1>
        <p className="text-gray-500 mt-1">Track your wellness journey over time</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {averages.map((a) => (
          <Card key={a.type} className="p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[a.type]}`}>
                {typeIcons[a.type]}
              </div>
              <span className="text-sm font-medium text-gray-600">{a.type.charAt(0) + a.type.slice(1).toLowerCase()}</span>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900">{a.avg}%</p>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${a.avg}%` }}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Log New Progress */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Log Today&apos;s Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={newEntry.type}
            onChange={(e) => setNewEntry((p) => ({ ...p, type: e.target.value }))}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
          >
            <option value="MOOD">Mood</option>
            <option value="SLEEP">Sleep Quality</option>
            <option value="EXERCISE">Exercise</option>
            <option value="MINDFULNESS">Mindfulness</option>
          </select>
          <div>
            <input
              type="range"
              min="0"
              max="100"
              value={newEntry.value}
              onChange={(e) => setNewEntry((p) => ({ ...p, value: e.target.value }))}
              className="w-full"
            />
            <p className="text-center text-sm text-gray-500">{newEntry.value}%</p>
          </div>
          <input
            type="text"
            placeholder="Add a note (optional)"
            value={newEntry.note}
            onChange={(e) => setNewEntry((p) => ({ ...p, note: e.target.value }))}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
          />
          <Button onClick={saveProgress} loading={saving}>Log Progress</Button>
        </div>
      </Card>

      {/* Recent Entries */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h2>
        <div className="space-y-3">
          {progress.slice(-10).reverse().map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[entry.type]}`}>
                  {typeIcons[entry.type]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{entry.type}</p>
                  <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {entry.note && <span className="text-xs text-gray-500">{entry.note}</span>}
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${entry.value}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-10">{Math.round(entry.value)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
