"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Trophy, Medal, Star, Users, Zap, PenLine, Heart } from "lucide-react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";

interface TeamScore {
  name: string; location: string; score: number; participation: number;
  members: number; exercisePoints: number; journalPoints: number; moodPoints: number;
}

export default function LeaderboardPage() {
  const { status } = useSession();
  const [teams, setTeams] = useState<TeamScore[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/company").then((r) => r.json()).then((org) => {
        const id = Array.isArray(org) ? org[0]?.id : (org?.organization?.id || org?.id);
        if (id) fetch(`/api/company/leaderboard?orgId=${id}`).then((r) => r.json()).then(setTeams);
      });
    }
  }, [status]);

  const medals = ["text-yellow-500", "text-gray-400", "text-orange-600"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Wellness Leaderboard</h1>
        <p className="text-gray-500 mt-1">Teams compete on collective wellness — not individual scores</p>
      </div>

      <div className="p-4 bg-primary-50 dark:bg-primary-950 rounded-xl text-sm text-primary-700 dark:text-primary-300">
        <strong>How scoring works:</strong> Exercises (+25pts each) + Journal entries (+10pts each) + Avg mood bonus.
        Ranked by total team score. Individual data is never shown.
      </div>

      {/* Top 3 Podium */}
      {teams.length >= 3 && (
        <div className="flex items-end justify-center space-x-4 py-8">
          {[1, 0, 2].map((idx) => {
            const team = teams[idx];
            if (!team) return null;
            const height = idx === 0 ? "h-40" : idx === 1 ? "h-32" : "h-24";
            return (
              <div key={idx} className="text-center">
                <div className={`w-20 ${height} gradient-bg rounded-t-xl flex flex-col items-center justify-end pb-3 text-white`}>
                  {idx === 0 ? <Trophy className="w-8 h-8 mb-1" /> : <Medal className={`w-6 h-6 mb-1 ${medals[idx]}`} />}
                  <p className="text-lg font-bold">{team.score}</p>
                  <p className="text-xs opacity-80">pts</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border rounded-b-xl p-2 w-20">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{team.name}</p>
                  <p className="text-[10px] text-gray-500">#{idx + 1}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-left text-gray-500">
              <th className="px-4 py-3 font-medium w-12">#</th>
              <th className="px-4 py-3 font-medium">Team</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium text-center">Members</th>
              <th className="px-4 py-3 font-medium text-center">Participation</th>
              <th className="px-4 py-3 font-medium text-center">Exercises</th>
              <th className="px-4 py-3 font-medium text-center">Journals</th>
              <th className="px-4 py-3 font-medium text-center">Mood</th>
              <th className="px-4 py-3 font-medium text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, i) => (
              <tr key={i} className={`border-t dark:border-gray-700 ${i < 3 ? "bg-yellow-50/50 dark:bg-yellow-950/20" : ""}`}>
                <td className="px-4 py-3">
                  {i < 3 ? <Medal className={`w-5 h-5 ${medals[i]}`} /> : <span className="text-gray-400">{i + 1}</span>}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{team.name}</td>
                <td className="px-4 py-3 text-gray-500">{team.location}</td>
                <td className="px-4 py-3 text-center"><Badge variant="default">{team.members}</Badge></td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={team.participation >= 70 ? "success" : team.participation >= 40 ? "warning" : "danger"}>
                    {team.participation}%
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center text-gray-500">{team.exercisePoints}</td>
                <td className="px-4 py-3 text-center text-gray-500">{team.journalPoints}</td>
                <td className="px-4 py-3 text-center text-gray-500">{team.moodPoints}</td>
                <td className="px-4 py-3 text-right font-bold text-primary-600">{team.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {teams.length === 0 && (
          <div className="p-12 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Add departments and employees to see the leaderboard</p>
          </div>
        )}
      </Card>
    </div>
  );
}
