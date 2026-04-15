"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Wind, Brain, Eye, Sparkles, Heart, Play, Pause,
  RotateCcw, CheckCircle, Clock, Star, Activity,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Tooltip from "@/components/ui/tooltip";

interface GuidedExercise {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  steps: string;
  difficulty: string;
  _count: { logs: number };
}

interface Step {
  instruction: string;
  duration: number;
  type?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  BREATHING: <Wind className="w-6 h-6" />,
  MEDITATION: <Brain className="w-6 h-6" />,
  GROUNDING: <Eye className="w-6 h-6" />,
  BODY_SCAN: <Activity className="w-6 h-6" />,
  VISUALIZATION: <Sparkles className="w-6 h-6" />,
  PMR: <Heart className="w-6 h-6" />,
};

const categoryColors: Record<string, string> = {
  BREATHING: "bg-blue-100 text-blue-600",
  MEDITATION: "bg-purple-100 text-purple-600",
  GROUNDING: "bg-green-100 text-green-600",
  BODY_SCAN: "bg-orange-100 text-orange-600",
  VISUALIZATION: "bg-pink-100 text-pink-600",
  PMR: "bg-red-100 text-red-600",
};

// Human-readable label + short explanation for the filter chips.
const categoryLabels: Record<string, { label: string; explain: string }> = {
  ALL: { label: "All", explain: "Every technique we offer." },
  BREATHING: { label: "Breathing", explain: "Controlled breath patterns that calm the nervous system in 2–5 minutes. Best first choice." },
  MEDITATION: { label: "Meditation", explain: "Guided attention practices that build focus and emotional resilience over time." },
  GROUNDING: { label: "Grounding", explain: "Use your senses to anchor in the present. Helpful for panic, anxiety, or dissociation." },
  BODY_SCAN: { label: "Body Scan", explain: "Slowly move attention through each part of your body to notice and release tension." },
  PMR: { label: "PMR", explain: "Progressive Muscle Relaxation — tense and release muscle groups one by one to let go of physical stress." },
  VISUALIZATION: { label: "Visualization", explain: "Guided imagery — picture a calming scene to shift your emotional state." },
};

const formatCategory = (cat: string) => categoryLabels[cat]?.label ?? cat;

export default function PatientExercises() {
  const { status } = useSession();
  const [exercises, setExercises] = useState<GuidedExercise[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [activeExercise, setActiveExercise] = useState<GuidedExercise | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/exercises").then((r) => r.json()).then(setExercises).catch(console.error);
    }
  }, [status]);

  useEffect(() => {
    if (!isRunning || !activeExercise) return;
    const steps: Step[] = JSON.parse(activeExercise.steps).filter((s: Step) => s.duration > 0);
    const stepDuration = steps[currentStep]?.duration || 0;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev >= stepDuration) {
          if (currentStep < steps.length - 1) {
            setCurrentStep((s) => s + 1);
            return 0;
          } else {
            setIsRunning(false);
            setCompleted(true);
            return prev;
          }
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, currentStep, activeExercise]);

  const logCompletion = async (r: number) => {
    if (!activeExercise) return;
    setRating(r);
    await fetch("/api/exercises/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: activeExercise.id, completed: true, duration: activeExercise.duration, rating: r }),
    });
  };

  const resetExercise = () => {
    setCurrentStep(0);
    setTimer(0);
    setIsRunning(false);
    setCompleted(false);
    setRating(0);
  };

  const categories = ["ALL", "BREATHING", "MEDITATION", "GROUNDING", "BODY_SCAN", "PMR"];
  const filtered = filter === "ALL" ? exercises : exercises.filter((e) => e.category === filter);

  if (activeExercise) {
    const steps: Step[] = JSON.parse(activeExercise.steps).filter((s: Step) => s.duration > 0);
    const currentStepData = steps[currentStep];
    const stepDuration = currentStepData?.duration || 0;
    const progress = stepDuration > 0 ? (timer / stepDuration) * 100 : 0;
    const totalDuration = steps.reduce((s: number, st: Step) => s + st.duration, 0);
    const elapsed = steps.slice(0, currentStep).reduce((s: number, st: Step) => s + st.duration, 0) + timer;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={() => { setActiveExercise(null); resetExercise(); }}
          className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to exercises
        </button>

        <Card className="p-8 text-center">
          <Badge className={categoryColors[activeExercise.category] || ""}>
            {formatCategory(activeExercise.category)}
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">{activeExercise.title}</h1>
          {!completed && !isRunning && timer === 0 && currentStep === 0 && (
            <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-xl text-left">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Settle in first</p>
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                Sit comfortably. Put your phone on silent. Take one slow breath in, and a longer breath out.
                When you are ready, press Start.
              </p>
            </div>
          )}

          {!completed ? (
            <>
              {/* Visual timer */}
              <div className="relative w-48 h-48 mx-auto my-8">
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#timerGrad)" strokeWidth="6"
                    strokeDasharray={`${progress * 2.83} 283`} strokeLinecap="round" />
                  <defs>
                    <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-gray-900">{timer}s</p>
                  <p className="text-xs text-gray-400">of {stepDuration}s</p>
                </div>
              </div>

              {/* Current instruction */}
              <div className={`p-6 rounded-2xl mb-6 ${
                currentStepData?.type === "INHALE" ? "bg-blue-50" :
                currentStepData?.type === "EXHALE" ? "bg-green-50" :
                currentStepData?.type === "HOLD" ? "bg-yellow-50" :
                currentStepData?.type === "TENSE" ? "bg-red-50" :
                currentStepData?.type === "RELEASE" ? "bg-green-50" :
                "bg-gray-50"
              }`}>
                <p className="text-lg text-gray-800 leading-relaxed">{currentStepData?.instruction}</p>
                {currentStepData?.type && (
                  <Badge className="mt-2">{currentStepData.type}</Badge>
                )}
              </div>

              {/* Step progress */}
              <p className="text-sm text-gray-400 mb-4">
                Step {currentStep + 1} of {steps.length} &middot; {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} / {Math.floor(totalDuration / 60)}:{String(totalDuration % 60).padStart(2, "0")}
              </p>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button variant="outline" onClick={resetExercise}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
                <Button onClick={() => setIsRunning(!isRunning)} size="lg">
                  {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                  {isRunning ? "Pause" : "Start"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="my-8">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Well Done!</h2>
                <p className="text-gray-500 mt-2">You completed the {activeExercise.title} exercise.</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">How helpful was this exercise?</p>
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} onClick={() => logCompletion(r)}>
                      <Star className={`w-8 h-8 transition-colors ${r <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={() => { setActiveExercise(null); resetExercise(); }}>
                Done
              </Button>
            </>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Guided Exercises</h1>
        <p className="text-gray-500 mt-1">Breathing, meditation, and relaxation exercises — all under 15 minutes.</p>
      </div>

      {/* New-user hint */}
      <Card className="p-5 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 border-primary-200 dark:border-primary-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
          <Wind className="w-4 h-4 mr-2 text-primary-500" /> New to this? Start with Breathing.
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          Breathing exercises are the fastest, most research-backed way to calm your nervous system.
          Try the <strong>4-7-8 breath</strong> or <strong>Box breathing</strong> first — each takes under 5 minutes and needs no preparation.
          Move to meditation or body scans once you are comfortable.
        </p>
      </Card>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const info = categoryLabels[cat];
          const chip = (
            <button
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === cat ? "bg-primary-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}
            >
              {info?.label ?? cat}
            </button>
          );
          if (cat === "ALL") return <span key={cat}>{chip}</span>;
          return (
            <Tooltip key={cat} content={info?.explain ?? cat} maxWidth={260}>
              {chip}
            </Tooltip>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((ex) => (
          <Card key={ex.id} hover className="p-6 cursor-pointer" onClick={() => { setActiveExercise(ex); resetExercise(); }}>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${categoryColors[ex.category] || "bg-gray-100"}`}>
              {categoryIcons[ex.category] || <Sparkles className="w-6 h-6" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{ex.title}</h3>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{ex.description}</p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-3 text-xs text-gray-400">
                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {Math.floor(ex.duration / 60)} min</span>
                <Badge>{ex.difficulty}</Badge>
              </div>
              <Button size="sm" variant="primary">
                <Play className="w-4 h-4 mr-1" /> Start
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
