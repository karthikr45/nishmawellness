"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Award, Star, Flame, Trophy, Wind, Brain, Heart,
  Sparkles, Zap, PenLine, ClipboardList, Crown,
  Lock, TrendingUp,
} from "lucide-react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";

interface GamificationData {
  xp: number;
  level: number;
  xpForNextLevel: number;
  xpProgress: number;
  streaks: { journal: number; mood: number };
  stats: { journals: number; exercises: number; sessions: number; assessments: number; aiChats: number };
  badges: { id: string; name: string; desc: string; icon: string; earned: boolean }[];
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  pencil: <PenLine className="w-6 h-6" />,
  fire: <Flame className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
  trophy: <Trophy className="w-6 h-6" />,
  wind: <Wind className="w-6 h-6" />,
  brain: <Brain className="w-6 h-6" />,
  sparkles: <Sparkles className="w-6 h-6" />,
  heart: <Heart className="w-6 h-6" />,
  award: <Award className="w-6 h-6" />,
  clipboard: <ClipboardList className="w-6 h-6" />,
  bot: <Brain className="w-6 h-6" />,
  crown: <Crown className="w-6 h-6" />,
};

export default function AchievementsPage() {
  const { status } = useSession();
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/gamification")
        .then((r) => r.json())
        .then((d) => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  }

  if (!data) return null;

  const earnedBadges = data.badges.filter((b) => b.earned);
  const lockedBadges = data.badges.filter((b) => !b.earned);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Achievements & Rewards</h1>
        <p className="text-gray-500 mt-1">Track your wellness milestones</p>
      </div>

      {/* XP & Level Card */}
      <Card className="p-8 gradient-bg text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 right-10 w-32 h-32 rounded-full bg-white animate-float" />
          <div className="absolute bottom-5 left-10 w-24 h-24 rounded-full bg-white animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/70">Your Level</p>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-5xl font-bold">{data.level}</span>
                <div>
                  <p className="text-lg font-semibold">
                    {data.level >= 10 ? "Wellness Champion" : data.level >= 7 ? "Wellness Warrior" : data.level >= 4 ? "Rising Star" : data.level >= 2 ? "Wellness Explorer" : "Beginner"}
                  </p>
                  <p className="text-sm text-white/60">{data.xp} XP total</p>
                </div>
              </div>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10" />
            </div>
          </div>

          {/* XP Progress */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Level {data.level}</span>
              <span>{data.xp % 200} / 200 XP to Level {data.level + 1}</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full">
              <div className="h-3 bg-white rounded-full transition-all" style={{ width: `${data.xpProgress}%` }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Streaks & Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-5 text-center">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center mx-auto mb-2 text-orange-600 dark:text-orange-300">
            <Flame className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.streaks.journal}</p>
          <p className="text-xs text-gray-500">Journal Streak</p>
        </Card>
        <Card className="p-5 text-center">
          <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-xl flex items-center justify-center mx-auto mb-2 text-pink-600 dark:text-pink-300">
            <Heart className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.streaks.mood}</p>
          <p className="text-xs text-gray-500">Mood Streak</p>
        </Card>
        <Card className="p-5 text-center">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-2 text-green-600 dark:text-green-300">
            <PenLine className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.stats.journals}</p>
          <p className="text-xs text-gray-500">Total Journals</p>
        </Card>
        <Card className="p-5 text-center">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto mb-2 text-purple-600 dark:text-purple-300">
            <Wind className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.stats.exercises}</p>
          <p className="text-xs text-gray-500">Exercises Done</p>
        </Card>
        <Card className="p-5 text-center">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-2 text-blue-600 dark:text-blue-300">
            <Brain className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.stats.aiChats}</p>
          <p className="text-xs text-gray-500">AI Conversations</p>
        </Card>
      </div>

      {/* XP Breakdown */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-500" /> How You Earn XP
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { action: "Journal Entry", xp: 10, icon: <PenLine className="w-4 h-4" /> },
            { action: "Exercise", xp: 25, icon: <Wind className="w-4 h-4" /> },
            { action: "Assessment", xp: 50, icon: <ClipboardList className="w-4 h-4" /> },
            { action: "AI Chat", xp: 5, icon: <Brain className="w-4 h-4" /> },
            { action: "Therapy Session", xp: 100, icon: <Heart className="w-4 h-4" /> },
          ].map((item) => (
            <div key={item.action} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <div className="text-primary-600 flex justify-center mb-1">{item.icon}</div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.action}</p>
              <p className="text-sm font-bold text-yellow-600">+{item.xp} XP</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-primary-500" /> Earned Badges ({earnedBadges.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {earnedBadges.map((badge) => (
              <div key={badge.id} className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 rounded-xl text-center border-2 border-primary-200 dark:border-primary-800">
                <div className="w-14 h-14 gradient-bg rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                  {BADGE_ICONS[badge.icon] || <Star className="w-6 h-6" />}
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{badge.name}</p>
                <p className="text-xs text-gray-500 mt-1">{badge.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-gray-400" /> Badges to Unlock ({lockedBadges.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {lockedBadges.map((badge) => (
              <div key={badge.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center opacity-60">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <Lock className="w-6 h-6" />
                </div>
                <p className="font-semibold text-gray-600 dark:text-gray-400 text-sm">{badge.name}</p>
                <p className="text-xs text-gray-400 mt-1">{badge.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Motivation */}
      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 text-center">
        <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Keep Going!</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-md mx-auto">
          {data.level < 3
            ? "You're just getting started. Every action earns XP and brings you closer to your wellness goals!"
            : data.level < 7
            ? "You're building great habits! Keep logging your mood and journaling to maintain your streak."
            : "You're a wellness champion! Your consistency is inspiring. Share your journey with the community."}
        </p>
      </Card>
    </div>
  );
}
