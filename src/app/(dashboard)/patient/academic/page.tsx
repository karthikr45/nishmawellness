"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BookOpen, Brain, Clock, Target, TrendingUp,
  AlertTriangle, CheckCircle, Heart, Calendar,
  Lightbulb, ArrowRight, Sparkles,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

const STUDY_TIPS = [
  { title: "Pomodoro Technique", desc: "25 min focused study, 5 min break. After 4 rounds, take a 15-30 min break.", icon: <Clock className="w-5 h-5" />, link: "/patient/focus" },
  { title: "Active Recall", desc: "Test yourself instead of re-reading. Close the book and try to recall key points.", icon: <Brain className="w-5 h-5" /> },
  { title: "Spaced Repetition", desc: "Review material at increasing intervals: 1 day, 3 days, 1 week, 2 weeks.", icon: <Calendar className="w-5 h-5" /> },
  { title: "Mind Mapping", desc: "Create visual diagrams connecting concepts. Great for understanding relationships.", icon: <Target className="w-5 h-5" /> },
];

const EXAM_COPING = [
  { title: "Pre-Exam Breathing", desc: "4-7-8 breathing before an exam calms your nervous system in 60 seconds.", link: "/patient/exercises", color: "bg-blue-50 text-blue-700" },
  { title: "Grounding Exercise", desc: "Use the 5-4-3-2-1 technique if panic hits during the exam.", link: "/patient/exercises", color: "bg-green-50 text-green-700" },
  { title: "Positive Self-Talk", desc: "Replace 'I'll fail' with 'I've prepared and I'll do my best.'", color: "bg-purple-50 text-purple-700" },
  { title: "Body Scan", desc: "Release tension in your shoulders, jaw, and hands before starting.", link: "/patient/exercises", color: "bg-orange-50 text-orange-700" },
];

const STRESS_AREAS = [
  { id: "exams", label: "Exam Pressure", emoji: "📝" },
  { id: "grades", label: "Grade Anxiety", emoji: "📊" },
  { id: "future", label: "Career Uncertainty", emoji: "🔮" },
  { id: "social", label: "Social Pressure", emoji: "👥" },
  { id: "family", label: "Family Expectations", emoji: "👨‍👩‍👧" },
  { id: "financial", label: "Financial Stress", emoji: "💰" },
  { id: "comparison", label: "Peer Comparison", emoji: "⚖️" },
  { id: "burnout", label: "Academic Burnout", emoji: "🔥" },
];

export default function AcademicStressPage() {
  const { data: session } = useSession();
  const [selectedStress, setSelectedStress] = useState<string[]>([]);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);

  const quickAssessment = [
    "I feel overwhelmed by my academic workload",
    "I have difficulty concentrating on studies",
    "I compare myself negatively to classmates",
    "I feel pressure from family about my performance",
    "I have trouble sleeping due to academic stress",
    "I doubt my ability to succeed",
    "I feel anxious before exams or deadlines",
    "I have lost interest in activities I used to enjoy",
  ];
  const [answers, setAnswers] = useState<number[]>(new Array(8).fill(-1));

  const submitAssessment = () => {
    const score = answers.reduce((s, a) => s + (a >= 0 ? a : 0), 0);
    setAssessmentScore(score);
    // Log to progress
    fetch("/api/users/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "MOOD", value: Math.max(0, 100 - score * 3) }),
    }).catch(console.error);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Wellness</h1>
        <p className="text-gray-500 mt-1">Tools and resources for managing academic stress</p>
      </div>

      {/* Quick Stress Check */}
      <Card className="p-6 gradient-bg text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 right-10 w-32 h-32 rounded-full bg-white animate-float" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">What&apos;s Stressing You?</h2>
          <p className="text-white/70 text-sm mb-4">Select all that apply — this helps us personalize your support</p>
          <div className="flex flex-wrap gap-2">
            {STRESS_AREAS.map((area) => (
              <button key={area.id}
                onClick={() => setSelectedStress((p) => p.includes(area.id) ? p.filter((s) => s !== area.id) : [...p, area.id])}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedStress.includes(area.id)
                    ? "bg-white text-primary-700 shadow-md"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}>
                {area.emoji} {area.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Academic Stress Assessment */}
      {!showAssessment ? (
        <Card className="p-6" onClick={() => setShowAssessment(true)}>
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Quick Academic Stress Check</p>
                <p className="text-sm text-gray-500">8 questions &middot; 2 minutes</p>
              </div>
            </div>
            <Button size="sm"><ArrowRight className="w-4 h-4" /></Button>
          </div>
        </Card>
      ) : assessmentScore !== null ? (
        <Card className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            assessmentScore <= 8 ? "bg-green-100" : assessmentScore <= 16 ? "bg-yellow-100" : "bg-red-100"
          }`}>
            {assessmentScore <= 8 ? <CheckCircle className="w-8 h-8 text-green-600" /> :
             assessmentScore <= 16 ? <AlertTriangle className="w-8 h-8 text-yellow-600" /> :
             <AlertTriangle className="w-8 h-8 text-red-600" />}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{assessmentScore}/32</p>
          <Badge variant={assessmentScore <= 8 ? "success" : assessmentScore <= 16 ? "warning" : "danger"}>
            {assessmentScore <= 8 ? "Low Stress" : assessmentScore <= 16 ? "Moderate Stress" : "High Stress"}
          </Badge>
          <p className="text-sm text-gray-500 mt-4">
            {assessmentScore <= 8 ? "You're managing academic stress well! Keep up your current habits." :
             assessmentScore <= 16 ? "You're experiencing moderate stress. Try the study tips and exercises below." :
             "Your stress levels are high. Consider talking to a counselor or booking a therapy session."}
          </p>
          <div className="flex justify-center space-x-3 mt-4">
            <Link href="/patient/ai-chat"><Button variant="outline"><Brain className="w-4 h-4 mr-1" /> Talk to AI</Button></Link>
            <Link href="/book"><Button><Calendar className="w-4 h-4 mr-1" /> Book Session</Button></Link>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Academic Stress Assessment</h3>
          <div className="space-y-4">
            {quickAssessment.map((q, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{i + 1}. {q}</p>
                <div className="flex space-x-2">
                  {[{ v: 0, l: "Never" }, { v: 1, l: "Sometimes" }, { v: 2, l: "Often" }, { v: 3, l: "Always" }].map((opt) => (
                    <button key={opt.v} onClick={() => setAnswers((p) => { const n = [...p]; n[i] = opt.v; return n; })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        answers[i] === opt.v ? "bg-primary-600 text-white" : "bg-white dark:bg-gray-700 border text-gray-600 dark:text-gray-300"
                      }`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <Button onClick={submitAssessment} disabled={answers.some((a) => a === -1)} className="w-full">
              See Results
            </Button>
          </div>
        </Card>
      )}

      {/* Study Tips */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" /> Study Smart Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STUDY_TIPS.map((tip) => (
            <Card key={tip.title} hover className="p-5">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-300 flex-shrink-0">
                  {tip.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{tip.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{tip.desc}</p>
                  {tip.link && (
                    <Link href={tip.link} className="text-xs text-primary-600 hover:underline mt-2 inline-block">
                      Try it now &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Exam Coping Strategies */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-red-500" /> Exam Day Coping
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXAM_COPING.map((strategy) => (
            <div key={strategy.title} className={`p-5 ${strategy.color} rounded-xl`}>
              <h3 className="font-semibold text-gray-900">{strategy.title}</h3>
              <p className="text-sm mt-1 opacity-80">{strategy.desc}</p>
              {strategy.link && (
                <Link href={strategy.link} className="text-xs font-medium hover:underline mt-2 inline-block">
                  Practice now &rarr;
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/patient/focus">
          <Card hover className="p-6 text-center cursor-pointer">
            <Clock className="w-8 h-8 text-primary-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Study Timer</h3>
            <p className="text-sm text-gray-500 mt-1">Pomodoro timer for focused study</p>
          </Card>
        </Link>
        <Link href="/patient/exercises">
          <Card hover className="p-6 text-center cursor-pointer">
            <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Quick Calm</h3>
            <p className="text-sm text-gray-500 mt-1">Breathing exercises for instant relief</p>
          </Card>
        </Link>
        <Link href="/patient/ai-chat">
          <Card hover className="p-6 text-center cursor-pointer">
            <Brain className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Talk to AI</h3>
            <p className="text-sm text-gray-500 mt-1">Chat about academic worries</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
