"use client";

import { useState, useEffect } from "react";
import { X, Smile, Frown, Meh, Heart, Zap } from "lucide-react";
import Button from "@/components/ui/button";

const MOODS = [
  { value: 2, emoji: "😢", label: "Terrible", color: "bg-red-100 border-red-300 text-red-700" },
  { value: 4, emoji: "😔", label: "Bad", color: "bg-orange-100 border-orange-300 text-orange-700" },
  { value: 5, emoji: "😐", label: "Okay", color: "bg-yellow-100 border-yellow-300 text-yellow-700" },
  { value: 7, emoji: "🙂", label: "Good", color: "bg-green-100 border-green-300 text-green-700" },
  { value: 9, emoji: "😄", label: "Great", color: "bg-emerald-100 border-emerald-300 text-emerald-700" },
];

export default function DailyMoodPopup() {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Check if user already checked in today
    const lastCheckIn = localStorage.getItem("nishma-mood-checkin");
    const today = new Date().toDateString();
    if (lastCheckIn !== today) {
      // Show after 2 second delay
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveMood = async () => {
    if (selected === null) return;
    try {
      await fetch("/api/users/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "MOOD", value: selected * 10 }),
      });
      localStorage.setItem("nishma-mood-checkin", new Date().toDateString());
      setSaved(true);
      setTimeout(() => setShow(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const dismiss = () => {
    localStorage.setItem("nishma-mood-checkin", new Date().toDateString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up">
        <button onClick={dismiss} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        {saved ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">
              {MOODS.find((m) => m.value === selected)?.emoji || "🙂"}
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">Thanks for checking in!</p>
            <p className="text-sm text-gray-500 mt-1">Your mood has been logged.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <Heart className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">How are you feeling today?</h3>
              <p className="text-sm text-gray-500 mt-1">A quick daily check-in helps track your wellness</p>
            </div>

            <div className="flex justify-center space-x-3 mb-6">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelected(mood.value)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    selected === mood.value
                      ? mood.color + " scale-110 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl mb-1">{mood.emoji}</span>
                  <span className="text-xs font-medium">{mood.label}</span>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <Button variant="ghost" onClick={dismiss} className="flex-1">Skip</Button>
              <Button onClick={saveMood} disabled={selected === null} className="flex-1">Log Mood</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
