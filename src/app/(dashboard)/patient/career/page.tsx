"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  GraduationCap, ArrowRight, CheckCircle, Star, Briefcase,
  TrendingUp, Target, Brain, Sparkles,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface CareerCluster {
  id: string; name: string; careers: string[]; traits: string[];
  score?: number; percentage?: number;
}

interface Question {
  q: string; clusters: string[];
}

export default function CareerPage() {
  const { status } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [clusters, setClusters] = useState<CareerCluster[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [results, setResults] = useState<{ topMatches: CareerCluster[]; allResults: CareerCluster[]; summary: string } | null>(null);
  const [step, setStep] = useState(0); // 0 = intro, 1 = assessment, 2 = results
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/career").then((r) => r.json()).then((data) => {
        setQuestions(data.questions);
        setClusters(data.clusters);
        setAnswers(new Array(data.questions.length).fill(3));
      });
    }
  }, [status]);

  const submit = async () => {
    setSubmitting(true);
    const res = await fetch("/api/career", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();
    setResults(data);
    setStep(2);
    setSubmitting(false);
  };

  const answeredCount = answers.filter((a) => a !== 3).length;

  // Intro
  if (step === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Career Explorer</h1>
          <p className="text-lg text-gray-500 mt-3 max-w-lg mx-auto">
            Discover career paths that match your interests, personality, and strengths. Takes about 5 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <Target className="w-6 h-6" />, title: "15 Questions", desc: "Rate your interest in different activities" },
            { icon: <Brain className="w-6 h-6" />, title: "8 Career Clusters", desc: "Matched to your personality" },
            { icon: <Sparkles className="w-6 h-6" />, title: "AI-Powered", desc: "Results saved — AI chat knows your interests" },
          ].map((f) => (
            <Card key={f.title} className="p-6 text-center">
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950 rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{f.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button onClick={() => setStep(1)} size="lg" className="rounded-2xl px-10">
            Start Assessment <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-xs text-gray-400 mt-3">Your responses help our AI give you career-relevant wellness support</p>
        </div>
      </div>
    );
  }

  // Results
  if (step === 2 && results) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Your Career Profile</h1>
          <p className="text-gray-500 mt-2">{results.summary}</p>
        </div>

        {/* Top 3 Matches */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.topMatches.map((match, i) => (
            <Card key={match.id} className={`p-6 ${i === 0 ? "border-2 border-primary-500 bg-primary-50 dark:bg-primary-950" : ""}`}>
              {i === 0 && <Badge className="mb-3 bg-primary-600 text-white">Best Match</Badge>}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{match.name}</h3>
                <span className="text-2xl font-extrabold gradient-text">{match.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div className="gradient-bg h-2 rounded-full" style={{ width: `${match.percentage}%` }} />
              </div>
              <p className="text-xs text-gray-500 font-medium mb-2">Suggested Careers:</p>
              <div className="flex flex-wrap gap-1">
                {match.careers.slice(0, 4).map((c) => (
                  <Badge key={c} variant="default" className="text-xs">{c}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* All Results */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">All Career Clusters</h2>
          <div className="space-y-3">
            {results.allResults.map((r) => (
              <div key={r.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300 w-48">{r.name}</span>
                <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="gradient-bg h-2.5 rounded-full transition-all" style={{ width: `${r.percentage}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white w-10 text-right">{r.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/patient/ai-chat">
            <Card hover className="p-5 text-center cursor-pointer">
              <Brain className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Talk to AI About Careers</p>
              <p className="text-xs text-gray-500 mt-1">AI knows your interests now</p>
            </Card>
          </Link>
          <Link href="/patient/interview-prep">
            <Card hover className="p-5 text-center cursor-pointer">
              <Briefcase className="w-8 h-8 text-secondary-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Interview Prep</p>
              <p className="text-xs text-gray-500 mt-1">Manage interview anxiety</p>
            </Card>
          </Link>
          <Link href="/book">
            <Card hover className="p-5 text-center cursor-pointer">
              <Star className="w-8 h-8 text-accent-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Career Counseling</p>
              <p className="text-xs text-gray-500 mt-1">Book a session with a counselor</p>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  // Assessment
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Career Interest Assessment</h1>
        <p className="text-gray-500 mt-1">Rate how much each statement describes you (1 = Not at all, 5 = Exactly me)</p>
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="gradient-bg h-2 rounded-full transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{answeredCount} of {questions.length}</p>
      </div>

      {questions.map((q, qi) => (
        <Card key={qi} className={`p-5 ${answers[qi] !== 3 ? "border-l-4 border-l-primary-400" : ""}`}>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">{qi + 1}. {q.q}</p>
          <div className="flex justify-between">
            {[
              { v: 1, l: "Not me" },
              { v: 2, l: "A little" },
              { v: 3, l: "Somewhat" },
              { v: 4, l: "A lot" },
              { v: 5, l: "Exactly me" },
            ].map((opt) => (
              <button key={opt.v}
                onClick={() => setAnswers((p) => { const n = [...p]; n[qi] = opt.v; return n; })}
                className={`flex-1 mx-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  answers[qi] === opt.v ? "gradient-bg text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                }`}>
                {opt.l}
              </button>
            ))}
          </div>
        </Card>
      ))}

      <Button onClick={submit} loading={submitting} className="w-full rounded-2xl" size="lg">
        See My Results <Sparkles className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
