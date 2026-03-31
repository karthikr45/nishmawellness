"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen, Play, CheckCircle, Clock, FileText, Headphones,
  Video, HelpCircle, ArrowLeft, ArrowRight, Award, Dumbbell,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import VideoPlayer from "@/components/video/video-player";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  type: string;
  content: string;
  duration: number;
  progress: { status: string; quizScore?: number }[];
}

interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
}

export default function ProgramLessons({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = use(params);
  const { status } = useSession();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch(`/api/lessons?programId=${programId}`)
        .then((r) => r.json())
        .then(setLessons)
        .catch(console.error);
    }
  }, [status, programId]);

  const getStatus = (lesson: Lesson) => {
    if (lesson.progress?.length > 0) return lesson.progress[0].status;
    return "NOT_STARTED";
  };

  const markComplete = async (lessonId: string, score?: number) => {
    setCompleting(true);
    await fetch("/api/lessons/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, status: "COMPLETED", quizScore: score }),
    });
    setLessons((prev) =>
      prev.map((l) =>
        l.id === lessonId ? { ...l, progress: [{ status: "COMPLETED", quizScore: score }] } : l
      )
    );
    setCompleting(false);
  };

  const submitQuiz = () => {
    if (!activeLesson) return;
    const content = JSON.parse(activeLesson.content);
    const questions: QuizQuestion[] = content.questions;
    let correct = 0;
    questions.forEach((q, i) => {
      if (quizAnswers[i] === q.correct) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    markComplete(activeLesson.id, score);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return <Video className="w-4 h-4" />;
      case "AUDIO": return <Headphones className="w-4 h-4" />;
      case "TEXT": return <FileText className="w-4 h-4" />;
      case "EXERCISE": return <Dumbbell className="w-4 h-4" />;
      case "QUIZ": return <HelpCircle className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const completedCount = lessons.filter((l) => getStatus(l) === "COMPLETED").length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  if (activeLesson) {
    const content = JSON.parse(activeLesson.content);
    const currentIndex = lessons.findIndex((l) => l.id === activeLesson.id);
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => { setActiveLesson(null); setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(null); }}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to lessons
        </button>

        <Card className="p-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
              {typeIcon(activeLesson.type)}
            </div>
            <div>
              <Badge>{activeLesson.type}</Badge>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{activeLesson.title}</h1>
            </div>
          </div>
          <p className="text-gray-500 mb-6">{activeLesson.description}</p>

          {/* TEXT content */}
          {activeLesson.type === "TEXT" && (
            <div className="prose prose-sm max-w-none">
              {content.body?.split("\n").map((line: string, i: number) => {
                if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold mt-6 mb-3">{line.slice(2)}</h1>;
                if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-semibold mt-5 mb-2">{line.slice(3)}</h2>;
                if (line.startsWith("- **")) {
                  const bold = line.match(/\*\*(.*?)\*\*/);
                  const rest = line.replace(/- \*\*.*?\*\*/, "").replace(" - ", "");
                  return <p key={i} className="ml-4 mb-1"><strong>{bold?.[1]}</strong>{rest}</p>;
                }
                if (line.startsWith("- ")) return <p key={i} className="ml-4 mb-1">• {line.slice(2)}</p>;
                if (line.match(/^\d+\./)) return <p key={i} className="ml-4 mb-1">{line}</p>;
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} className="mb-2 text-gray-700 leading-relaxed">{line}</p>;
              })}
            </div>
          )}

          {/* VIDEO content */}
          {activeLesson.type === "VIDEO" && (
            <div>
              <VideoPlayer
                title={activeLesson.title}
                description={content.videoDescription}
                duration={activeLesson.duration * 60}
                onComplete={() => markComplete(activeLesson.id)}
              />
              {content.keyPoints && (
                <div className="p-4 bg-primary-50 rounded-xl mt-6">
                  <p className="font-medium text-gray-900 mb-2">Key Takeaways:</p>
                  {content.keyPoints.map((point: string, i: number) => (
                    <p key={i} className="text-sm text-gray-700 flex items-start mb-1">
                      <CheckCircle className="w-4 h-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                      {point}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AUDIO content */}
          {activeLesson.type === "AUDIO" && (
            <div>
              <div className="bg-gradient-to-r from-secondary-100 to-primary-100 rounded-2xl p-8 text-center mb-6">
                <Headphones className="w-16 h-16 mx-auto mb-3 text-secondary-600" />
                <p className="text-lg font-medium text-gray-900">Guided Audio Session</p>
                <p className="text-sm text-gray-500 mt-1">{content.instructions}</p>
                <div className="mt-4 bg-white rounded-full h-2 w-full max-w-md mx-auto">
                  <div className="bg-secondary-500 h-2 rounded-full w-0 transition-all" />
                </div>
              </div>
              {content.steps && (
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Session Flow:</p>
                  {content.steps.map((step: string, i: number) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <span className="w-6 h-6 bg-secondary-100 text-secondary-700 rounded-full flex items-center justify-center text-xs font-medium">{i + 1}</span>
                      <span className="text-sm text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXERCISE content */}
          {activeLesson.type === "EXERCISE" && (
            <div>
              <div className="p-4 bg-green-50 rounded-xl mb-6">
                <p className="text-sm text-green-800">{content.instructions}</p>
              </div>
              {content.steps && (
                <div className="space-y-3">
                  {content.steps.map((step: string, i: number) => (
                    <div key={i} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                      <span className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                      <p className="text-sm text-gray-700 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              )}
              {content.bodyParts && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {content.bodyParts.map((part: string, i: number) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl text-center text-sm text-gray-700">{part}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* QUIZ content */}
          {activeLesson.type === "QUIZ" && content.questions && (
            <div className="space-y-6">
              {content.questions.map((q: QuizQuestion, qi: number) => (
                <div key={qi} className="p-5 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-900 mb-3">{qi + 1}. {q.q}</p>
                  <div className="space-y-2">
                    {q.options.map((opt: string, oi: number) => {
                      const isSelected = quizAnswers[qi] === oi;
                      const isCorrect = quizSubmitted && oi === q.correct;
                      const isWrong = quizSubmitted && isSelected && oi !== q.correct;
                      return (
                        <button
                          key={oi}
                          onClick={() => !quizSubmitted && setQuizAnswers((p) => ({ ...p, [qi]: oi }))}
                          disabled={quizSubmitted}
                          className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${
                            isCorrect ? "border-green-500 bg-green-50 text-green-800" :
                            isWrong ? "border-red-500 bg-red-50 text-red-800" :
                            isSelected ? "border-primary-500 bg-primary-50" :
                            "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {!quizSubmitted ? (
                <Button onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < content.questions.length} className="w-full">
                  Submit Answers
                </Button>
              ) : (
                <div className="p-6 bg-primary-50 rounded-xl text-center">
                  <Award className="w-12 h-12 mx-auto mb-3 text-primary-600" />
                  <p className="text-2xl font-bold text-gray-900">Score: {quizScore}%</p>
                  <p className="text-gray-500 mt-1">{quizScore! >= 80 ? "Excellent work!" : quizScore! >= 60 ? "Good job! Review and try again." : "Keep studying and try again."}</p>
                </div>
              )}
            </div>
          )}

          {/* Complete / Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {prevLesson ? (
              <Button variant="ghost" onClick={() => { setActiveLesson(prevLesson); setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(null); }}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
            ) : <div />}

            {getStatus(activeLesson) !== "COMPLETED" && activeLesson.type !== "QUIZ" && (
              <Button onClick={() => markComplete(activeLesson.id)} loading={completing}>
                <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete
              </Button>
            )}

            {nextLesson && (
              <Button variant="outline" onClick={() => { setActiveLesson(nextLesson); setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(null); }}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Link href="/patient/programs" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Lessons</h1>
          <p className="text-gray-500 mt-1">{completedCount} of {lessons.length} lessons completed</p>
        </div>
      </div>

      {/* Progress bar */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-primary-600">{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-primary-500 h-3 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </Card>

      {/* Lessons list */}
      <div className="space-y-3">
        {lessons.map((lesson, i) => {
          const lessonStatus = getStatus(lesson);
          const isCompleted = lessonStatus === "COMPLETED";

          return (
            <Card
              key={lesson.id}
              hover
              className={`p-5 cursor-pointer ${isCompleted ? "border-l-4 border-l-green-500" : ""}`}
            >
              <button className="w-full text-left" onClick={() => setActiveLesson(lesson)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isCompleted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <span className="font-bold text-sm">{i + 1}</span>}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                        <Badge>{lesson.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {lesson.duration} min
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? "bg-green-100 text-green-600" : "bg-primary-100 text-primary-600"
                    }`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : typeIcon(lesson.type)}
                    </div>
                  </div>
                </div>
              </button>
            </Card>
          );
        })}
      </div>

      {lessons.length === 0 && (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No lessons available yet</p>
        </Card>
      )}
    </div>
  );
}
