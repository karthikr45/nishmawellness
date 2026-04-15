"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ClipboardList, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Calendar } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { useToast } from "@/components/providers/toast-provider";
import Tooltip from "@/components/ui/tooltip";

interface AssessmentResult {
  id: string;
  type: string;
  score: number;
  severity: string;
  createdAt: string;
}

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking so slowly that other people noticed, or being fidgety/restless",
  "Thoughts that you would be better off dead, or of hurting yourself",
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen",
];

const ANSWER_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

const severityColors: Record<string, string> = {
  MINIMAL: "bg-green-100 text-green-700",
  MILD: "bg-yellow-100 text-yellow-700",
  MODERATE: "bg-orange-100 text-orange-700",
  MODERATELY_SEVERE: "bg-red-100 text-red-700",
  SEVERE: "bg-red-200 text-red-800",
};

export default function PatientAssessments() {
  const { status } = useSession();
  const toast = useToast();
  const [history, setHistory] = useState<AssessmentResult[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/assessments").then((r) => r.json()).then(setHistory).catch(console.error);
    }
  }, [status]);

  const questions = activeAssessment === "PHQ9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;

  const startAssessment = (type: string) => {
    setActiveAssessment(type);
    setAnswers(new Array(type === "PHQ9" ? 9 : 7).fill(-1));
    setResult(null);
  };

  const submit = async () => {
    if (answers.some((a) => a === -1)) {
      toast.warning("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeAssessment, responses: answers }),
      });
      if (!res.ok) throw new Error("submit failed");
      const data = await res.json();
      setResult(data);
      setHistory((prev) => [data, ...prev]);
      toast.success("Assessment submitted — see your results below.");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't submit. Please try again.");
    }
    setSubmitting(false);
  };

  if (result) {
    const maxScore = activeAssessment === "PHQ9" ? 27 : 21;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8 text-center">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            result.severity === "MINIMAL" || result.severity === "MILD" ? "bg-green-100" : "bg-orange-100"
          }`}>
            {result.severity === "MINIMAL" || result.severity === "MILD"
              ? <CheckCircle className="w-10 h-10 text-green-600" />
              : <AlertTriangle className="w-10 h-10 text-orange-600" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {activeAssessment === "PHQ9" ? "Depression Screening" : "Anxiety Screening"} Results
          </h2>
          <p className="text-4xl font-bold gradient-text mb-2">{result.score} / {maxScore}</p>
          <Badge className={`text-sm px-4 py-1 ${severityColors[result.severity] || ""}`}>
            {result.severity.replace("_", " ")}
          </Badge>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left">
            <p className="text-sm text-gray-700 leading-relaxed">
              {result.severity === "MINIMAL" && "Your score suggests minimal symptoms. Continue your current wellness practices and check in again in a few weeks."}
              {result.severity === "MILD" && "Your score suggests mild symptoms. Consider maintaining your self-care routine and monitoring how you feel. Our AI wellness chat and guided exercises can help."}
              {result.severity === "MODERATE" && "Your score suggests moderate symptoms. We recommend scheduling a session with a therapist to discuss your well-being and develop a support plan."}
              {result.severity === "MODERATELY_SEVERE" && "Your score suggests moderately severe symptoms. We strongly recommend booking a therapy session soon. You don't have to face this alone."}
              {result.severity === "SEVERE" && "Your score suggests severe symptoms. Please reach out to a therapist as soon as possible. If you're in crisis, call 988 (Suicide & Crisis Lifeline)."}
            </p>
          </div>

          <div className="flex space-x-3 mt-6 justify-center">
            <Button variant="outline" onClick={() => { setActiveAssessment(null); setResult(null); }}>View History</Button>
            <Button onClick={() => { window.location.href = "/book"; }}>Book a Session</Button>
          </div>
        </Card>

        {(result.severity === "SEVERE" || result.severity === "MODERATELY_SEVERE") && (
          <Card className="p-4 bg-red-50 border-2 border-red-200">
            <p className="text-sm text-red-800 font-medium">
              If you&apos;re having thoughts of self-harm, please call 988 (Suicide & Crisis Lifeline) or text HOME to 741741.
            </p>
          </Card>
        )}
      </div>
    );
  }

  if (activeAssessment) {
    const answeredCount = answers.filter((a) => a >= 0).length;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            {activeAssessment === "PHQ9" ? "PHQ-9: Depression Screening" : "GAD-7: Anxiety Screening"}
            <Tooltip
              content={
                activeAssessment === "PHQ9"
                  ? "PHQ-9 (Patient Health Questionnaire-9) is a validated 9-question depression screening tool used by clinicians worldwide. Scores range 0-27 and indicate severity from minimal to severe."
                  : "GAD-7 (Generalised Anxiety Disorder-7) is a validated 7-question anxiety screening tool used widely in clinical practice. Scores range 0-21 and indicate severity from minimal to severe."
              }
            />
          </h1>
          <p className="text-gray-500 mt-1">Over the last 2 weeks, how often have you been bothered by the following?</p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{answeredCount} of {questions.length} answered</p>
        </div>

        {questions.map((q, qi) => (
          <Card key={qi} className={`p-5 ${answers[qi] >= 0 ? "border-l-4 border-l-primary-400" : ""}`}>
            <p className="font-medium text-gray-900 mb-3">{qi + 1}. {q}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ANSWER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAnswers((prev) => { const n = [...prev]; n[qi] = opt.value; return n; })}
                  className={`p-3 rounded-xl text-sm text-center border-2 transition-all ${
                    answers[qi] === opt.value
                      ? "border-primary-500 bg-primary-50 text-primary-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                  <span className="block text-xs mt-1 opacity-60">({opt.value})</span>
                </button>
              ))}
            </div>
          </Card>
        ))}

        <div className="flex space-x-3">
          <Button variant="ghost" onClick={() => setActiveAssessment(null)}>Cancel</Button>
          <Button onClick={submit} loading={submitting} disabled={answers.some((a) => a === -1)} className="flex-1">
            Submit Assessment <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wellness Assessments</h1>
        <p className="text-gray-500 mt-1">Standardized screening tools to track your mental health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hover className="p-6 cursor-pointer" onClick={() => startAssessment("PHQ9")}>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">PHQ-9</h3>
          <p className="text-sm text-gray-500 mt-1">Patient Health Questionnaire for depression screening. 9 questions, takes about 3 minutes.</p>
          <Button variant="outline" size="sm" className="mt-4">
            Take Assessment <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Card>

        <Card hover className="p-6 cursor-pointer" onClick={() => startAssessment("GAD7")}>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">GAD-7</h3>
          <p className="text-sm text-gray-500 mt-1">Generalized Anxiety Disorder assessment. 7 questions, takes about 2 minutes.</p>
          <Button variant="outline" size="sm" className="mt-4">
            Take Assessment <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Card>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" /> Assessment History
          </h2>
          <div className="space-y-3">
            {history.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Badge variant="info">{a.type}</Badge>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" /> {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-gray-900">Score: {a.score}</span>
                  <Badge className={severityColors[a.severity] || ""}>{a.severity.replace("_", " ")}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
