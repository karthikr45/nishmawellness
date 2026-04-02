"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Clock, CheckCircle, Coffee, Brain, Zap } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

type TimerMode = "focus" | "break" | "longBreak";

const PRESETS = [
  { name: "Classic Pomodoro", focus: 25, break: 5, longBreak: 15, rounds: 4 },
  { name: "Short Focus", focus: 15, break: 3, longBreak: 10, rounds: 4 },
  { name: "Deep Work", focus: 50, break: 10, longBreak: 20, rounds: 3 },
  { name: "Quick Burst", focus: 10, break: 2, longBreak: 5, rounds: 6 },
];

export default function FocusTimerPage() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [round, setRound] = useState(1);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (mode === "focus") setTotalFocusTime((prev) => prev + 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer complete
      if (mode === "focus") {
        setCompletedSessions((prev) => prev + 1);
        // Play notification sound
        if (typeof window !== "undefined") {
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            osc.frequency.value = 440;
            osc.connect(ctx.destination);
            osc.start();
            setTimeout(() => osc.stop(), 200);
          } catch {}
        }

        if (round % preset.rounds === 0) {
          setMode("longBreak");
          setTimeLeft(preset.longBreak * 60);
        } else {
          setMode("break");
          setTimeLeft(preset.break * 60);
        }
      } else {
        setMode("focus");
        setTimeLeft(preset.focus * 60);
        if (mode === "longBreak") setRound(1);
        else setRound((prev) => prev + 1);
      }
      setIsRunning(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, mode, round, preset]);

  const reset = () => {
    setIsRunning(false);
    setMode("focus");
    setTimeLeft(preset.focus * 60);
    setRound(1);
  };

  const selectPreset = (p: typeof PRESETS[0]) => {
    setPreset(p);
    setIsRunning(false);
    setMode("focus");
    setTimeLeft(p.focus * 60);
    setRound(1);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalTime = mode === "focus" ? preset.focus * 60 : mode === "break" ? preset.break * 60 : preset.longBreak * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const modeColors = {
    focus: "from-primary-500 to-secondary-500",
    break: "from-green-500 to-emerald-500",
    longBreak: "from-blue-500 to-cyan-500",
  };

  const modeLabels = {
    focus: "Focus Time",
    break: "Short Break",
    longBreak: "Long Break",
  };

  const modeIcons = {
    focus: <Brain className="w-6 h-6" />,
    break: <Coffee className="w-6 h-6" />,
    longBreak: <Coffee className="w-6 h-6" />,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Focus Timer</h1>
        <p className="text-gray-500 mt-1">Pomodoro-style timer for productive focus sessions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <Zap className="w-5 h-5 mx-auto mb-1 text-orange-500" />
          <p className="text-xl font-bold text-gray-900 dark:text-white">{completedSessions}</p>
          <p className="text-xs text-gray-500">Sessions Done</p>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <p className="text-xl font-bold text-gray-900 dark:text-white">{Math.floor(totalFocusTime / 60)}m</p>
          <p className="text-xs text-gray-500">Focus Time</p>
        </Card>
        <Card className="p-4 text-center">
          <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
          <p className="text-xl font-bold text-gray-900 dark:text-white">{round}/{preset.rounds}</p>
          <p className="text-xs text-gray-500">Current Round</p>
        </Card>
      </div>

      {/* Timer */}
      <Card className="p-8">
        <div className="text-center">
          {/* Mode indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${modeColors[mode]} flex items-center justify-center text-white`}>
              {modeIcons[mode]}
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">{modeLabels[mode]}</span>
            <Badge variant={mode === "focus" ? "danger" : "success"}>{preset.name}</Badge>
          </div>

          {/* Circular timer */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            <svg className="w-64 h-64 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4"
                className="text-gray-200 dark:text-gray-700" />
              <circle cx="50" cy="50" r="45" fill="none" strokeWidth="4"
                stroke={`url(#focusGrad)`} strokeDasharray={`${progress * 2.83} 283`} strokeLinecap="round" />
              <defs>
                <linearGradient id="focusGrad">
                  <stop offset="0%" stopColor={mode === "focus" ? "#22c55e" : mode === "break" ? "#10b981" : "#3b82f6"} />
                  <stop offset="100%" stopColor={mode === "focus" ? "#a855f7" : mode === "break" ? "#34d399" : "#06b6d4"} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-5xl font-bold text-gray-900 dark:text-white font-mono">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </p>
              <p className="text-sm text-gray-500 mt-1">Round {round} of {preset.rounds}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="w-5 h-5" />
            </Button>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${modeColors[mode]} text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-all`}
            >
              {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </button>
            <div className="w-12" /> {/* Spacer */}
          </div>

          {/* Round indicators */}
          <div className="flex items-center justify-center space-x-2 mt-6">
            {Array.from({ length: preset.rounds }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${
                i < round - 1 ? "bg-primary-500" :
                i === round - 1 && mode === "focus" ? "bg-primary-500 animate-pulse" :
                "bg-gray-200 dark:bg-gray-700"
              }`} />
            ))}
          </div>
        </div>
      </Card>

      {/* Presets */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timer Presets</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRESETS.map((p) => (
            <button key={p.name} onClick={() => selectPreset(p)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                preset.name === p.name
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-950"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{p.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {p.focus}m focus / {p.break}m break / {p.rounds} rounds
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Focus Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
          <p>&bull; Put your phone on silent during focus periods</p>
          <p>&bull; Close unnecessary browser tabs</p>
          <p>&bull; Have water nearby to stay hydrated</p>
          <p>&bull; During breaks, stand up and stretch</p>
          <p>&bull; Use the long break for a mindful walk</p>
          <p>&bull; Pair with ambient sounds from Sleep & Relaxation</p>
        </div>
      </Card>
    </div>
  );
}
