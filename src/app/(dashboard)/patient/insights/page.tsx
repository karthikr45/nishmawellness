"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BarChart3, TrendingUp, TrendingDown, Minus, Heart, Moon,
  Zap, Brain, Calendar, BookOpen, ArrowRight, Award,
  Sparkles, AlertTriangle, CheckCircle, MessageSquare, Wind,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface WeeklyReport {
  period: { label: string };
  overallWellness: { score: number | null; comparison: { change: number; direction: string } };
  metrics: {
    mood: { current: number | null; comparison: { change: number; direction: string } };
    sleep: { current: number | null; comparison: { change: number; direction: string } };
    anxiety: { current: number | null; comparison: { change: number; direction: string } };
    energy: { current: number | null };
  };
  activity: {
    journalEntries: { current: number; previous: number };
    exercises: { current: number; previous: number };
    aiChats: { current: number; previous: number };
    sessions: { current: number; previous: number };
  };
  dailyMood: { day: string; mood: number | null; sleep: number | null; energy: number | null }[];
  highlights: string[];
  recommendations: string[];
  recentAssessments: { type: string; score: number; severity: string; date: string }[];
  activePrograms: { title: string; progress: number }[];
  topThemes: string[];
}

interface SessionInsight {
  sessionId: string;
  date: string;
  duration: number;
  messageCount: number;
  topicsDiscussed: string[];
  moodDetected: { score: number; label: string };
  techniquesSuggested: string[];
  actionItems: string[];
  engagementScore: number;
  summary: string;
}

export default function InsightsPage() {
  const { status } = useSession();
  const [weekly, setWeekly] = useState<WeeklyReport | null>(null);
  const [sessionInsight, setSessionInsight] = useState<SessionInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/insights/weekly").then((r) => r.json()),
        fetch("/api/insights/session").then((r) => r.json()),
      ]).then(([w, s]) => {
        setWeekly(w);
        setSessionInsight(s);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  }

  const TrendIcon = ({ direction }: { direction: string }) =>
    direction === "up" ? <TrendingUp className="w-4 h-4 text-green-500" /> :
    direction === "down" ? <TrendingDown className="w-4 h-4 text-red-500" /> :
    <Minus className="w-4 h-4 text-gray-400" />;

  const trendColor = (direction: string, invert = false) => {
    if (invert) return direction === "up" ? "text-red-500" : direction === "down" ? "text-green-500" : "text-gray-400";
    return direction === "up" ? "text-green-500" : direction === "down" ? "text-red-500" : "text-gray-400";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wellness Insights</h1>
          <p className="text-gray-500 mt-1">{weekly?.period.label || "This week"}</p>
        </div>
        <Link href="/patient/achievements">
          <Button variant="outline"><Award className="w-4 h-4 mr-2" /> Achievements</Button>
        </Link>
      </div>

      {/* Overall Wellness Score */}
      {weekly && (
        <Card className="p-8 gradient-bg text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-5 right-10 w-40 h-40 rounded-full bg-white animate-float" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Overall Wellness Score</p>
              <div className="flex items-end space-x-3 mt-2">
                <span className="text-5xl font-bold">{weekly.overallWellness.score ?? "—"}</span>
                <span className="text-2xl text-white/60 mb-1">/100</span>
              </div>
              {weekly.overallWellness.comparison.direction !== "same" && (
                <p className={`text-sm mt-2 flex items-center ${weekly.overallWellness.comparison.direction === "up" ? "text-green-300" : "text-red-300"}`}>
                  {weekly.overallWellness.comparison.direction === "up" ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {weekly.overallWellness.comparison.change}% vs last week
                </p>
              )}
            </div>
            <div className="hidden md:block">
              <Sparkles className="w-16 h-16 text-white/20" />
            </div>
          </div>
        </Card>
      )}

      {/* Metric Cards */}
      {weekly && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Mood", value: weekly.metrics.mood.current, icon: <Heart className="w-5 h-5" />, color: "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300", comparison: weekly.metrics.mood.comparison },
            { label: "Sleep", value: weekly.metrics.sleep.current, icon: <Moon className="w-5 h-5" />, color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300", comparison: weekly.metrics.sleep.comparison },
            { label: "Energy", value: weekly.metrics.energy.current, icon: <Zap className="w-5 h-5" />, color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300", comparison: null },
            { label: "Anxiety", value: weekly.metrics.anxiety.current, icon: <AlertTriangle className="w-5 h-5" />, color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300", comparison: weekly.metrics.anxiety.comparison, invert: true },
          ].map((metric) => (
            <Card key={metric.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metric.color}`}>
                  {metric.icon}
                </div>
                {metric.comparison && <TrendIcon direction={metric.comparison.direction} />}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value !== null ? `${metric.value}%` : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">{metric.label}</p>
              {metric.comparison && metric.comparison.change > 0 && (
                <p className={`text-xs mt-1 ${metric.invert ? trendColor(metric.comparison.direction, true) : trendColor(metric.comparison.direction)}`}>
                  {metric.comparison.direction === "up" ? "+" : "-"}{metric.comparison.change}% vs last week
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Daily Mood Chart */}
      {weekly && weekly.dailyMood.some((d) => d.mood !== null) && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Mood This Week</h2>
          <div className="flex items-end justify-between h-40 px-2">
            {weekly.dailyMood.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="flex-1 w-full flex items-end justify-center space-x-1 px-1">
                  {day.mood !== null && (
                    <div className="w-full max-w-[20px] gradient-bg rounded-t-lg transition-all"
                      style={{ height: `${day.mood}%` }} title={`Mood: ${day.mood}%`} />
                  )}
                  {day.sleep !== null && (
                    <div className="w-full max-w-[20px] bg-blue-400 rounded-t-lg transition-all"
                      style={{ height: `${day.sleep}%` }} title={`Sleep: ${day.sleep}%`} />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">{day.day}</p>
                {day.mood !== null && <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{day.mood}%</p>}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-gray-400">
            <span className="flex items-center"><div className="w-3 h-3 gradient-bg rounded mr-1" /> Mood</span>
            <span className="flex items-center"><div className="w-3 h-3 bg-blue-400 rounded mr-1" /> Sleep</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Summary */}
        {weekly && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Activity</h2>
            <div className="space-y-4">
              {[
                { label: "Journal Entries", icon: <BookOpen className="w-4 h-4" />, current: weekly.activity.journalEntries.current, previous: weekly.activity.journalEntries.previous, color: "bg-green-100 text-green-600" },
                { label: "Exercises", icon: <Wind className="w-4 h-4" />, current: weekly.activity.exercises.current, previous: weekly.activity.exercises.previous, color: "bg-purple-100 text-purple-600" },
                { label: "AI Conversations", icon: <Brain className="w-4 h-4" />, current: weekly.activity.aiChats.current, previous: weekly.activity.aiChats.previous, color: "bg-blue-100 text-blue-600" },
                { label: "Therapy Sessions", icon: <Calendar className="w-4 h-4" />, current: weekly.activity.sessions.current, previous: weekly.activity.sessions.previous, color: "bg-orange-100 text-orange-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>{item.icon}</div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{item.current}</span>
                    {item.previous > 0 && (
                      <span className={`text-xs ${item.current > item.previous ? "text-green-500" : item.current < item.previous ? "text-red-500" : "text-gray-400"}`}>
                        vs {item.previous}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Highlights & Recommendations */}
        {weekly && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-500" /> Highlights
              </h2>
              <div className="space-y-2">
                {weekly.highlights.map((h, i) => (
                  <div key={i} className="flex items-start space-x-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{h}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-primary-500" /> Recommendations
              </h2>
              <div className="space-y-2">
                {weekly.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start space-x-2 p-2 bg-primary-50 dark:bg-primary-950 rounded-lg">
                    <ArrowRight className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{r}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Latest Session Insight Card */}
      {sessionInsight && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-secondary-500" /> Latest Session Insight
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessionInsight.duration}m</p>
              <p className="text-xs text-gray-500">Duration</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessionInsight.messageCount}</p>
              <p className="text-xs text-gray-500">Messages</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <p className={`text-2xl font-bold ${sessionInsight.moodDetected.score >= 60 ? "text-green-600" : sessionInsight.moodDetected.score >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                {sessionInsight.moodDetected.label}
              </p>
              <p className="text-xs text-gray-500">Mood Detected</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <p className="text-2xl font-bold text-primary-600">{sessionInsight.engagementScore}%</p>
              <p className="text-xs text-gray-500">Engagement</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{sessionInsight.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sessionInsight.topicsDiscussed.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-2">Topics Discussed</p>
                <div className="flex flex-wrap gap-1">
                  {sessionInsight.topicsDiscussed.map((t) => (
                    <Badge key={t} variant="info">{t}</Badge>
                  ))}
                </div>
              </div>
            )}
            {sessionInsight.techniquesSuggested.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-2">Techniques Explored</p>
                <div className="flex flex-wrap gap-1">
                  {sessionInsight.techniquesSuggested.map((t) => (
                    <Badge key={t} variant="success">{t}</Badge>
                  ))}
                </div>
              </div>
            )}
            {sessionInsight.actionItems.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-2">Action Items</p>
                {sessionInsight.actionItems.map((a, i) => (
                  <p key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start mb-1">
                    <CheckCircle className="w-3 h-3 text-primary-500 mr-1 mt-0.5 flex-shrink-0" />
                    {a.length > 100 ? a.substring(0, 100) + "..." : a}
                  </p>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Top Themes */}
      {weekly && weekly.topThemes.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your Recurring Themes</h2>
          <div className="flex flex-wrap gap-2">
            {weekly.topThemes.map((theme, i) => (
              <span key={i} className="px-4 py-2 bg-secondary-50 dark:bg-secondary-950 text-secondary-700 dark:text-secondary-300 rounded-full text-sm font-medium">
                {theme}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
