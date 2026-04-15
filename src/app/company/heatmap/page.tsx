"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Activity, AlertTriangle, CheckCircle, MapPin, Users } from "lucide-react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";

interface HeatmapEntry {
  name: string; type: string; parentName?: string; members: number;
  avgMood: number | null; engagement: number; status: string;
}

const statusColors: Record<string, string> = {
  HEALTHY: "bg-green-500", MODERATE: "bg-yellow-500", CONCERNING: "bg-orange-500", CRITICAL: "bg-red-500", NO_DATA: "bg-gray-300",
};
const statusBg: Record<string, string> = {
  HEALTHY: "bg-green-50 border-green-200", MODERATE: "bg-yellow-50 border-yellow-200",
  CONCERNING: "bg-orange-50 border-orange-200", CRITICAL: "bg-red-50 border-red-200", NO_DATA: "bg-gray-50 border-gray-200",
};

export default function HeatmapPage() {
  const { status } = useSession();
  const [data, setData] = useState<HeatmapEntry[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/company").then((r) => r.json()).then((org) => {
        const id = Array.isArray(org) ? org[0]?.id : (org?.organization?.id || org?.id);
        if (id) fetch(`/api/company/heatmap?orgId=${id}`).then((r) => r.json()).then(setData);
      });
    }
  }, [status]);

  const locations = data.filter((d) => d.type === "LOCATION");
  const departments = data.filter((d) => d.type === "DEPARTMENT");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wellness Heatmap</h1>
        <p className="text-gray-500 mt-1">Visual overview of team wellness across your organization</p>
      </div>

      <div className="flex items-center space-x-4 text-xs">
        {[
          { status: "HEALTHY", label: "Healthy (70%+)" },
          { status: "MODERATE", label: "Moderate (50-70%)" },
          { status: "CONCERNING", label: "Concerning (30-50%)" },
          { status: "CRITICAL", label: "Critical (<30%)" },
        ].map((s) => (
          <div key={s.status} className="flex items-center space-x-1">
            <div className={`w-3 h-3 rounded-full ${statusColors[s.status]}`} />
            <span className="text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Location Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => (
          <Card key={loc.name} className={`p-5 border-2 ${statusBg[loc.status]}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${statusColors[loc.status]}`} />
                <h3 className="font-semibold text-gray-900 dark:text-white">{loc.name}</h3>
              </div>
              <Badge variant={loc.status === "HEALTHY" ? "success" : loc.status === "CRITICAL" ? "danger" : "warning"}>
                {loc.status}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{loc.avgMood ?? "—"}%</p>
                <p className="text-gray-500">Mood</p>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{loc.engagement}%</p>
                <p className="text-gray-500">Active</p>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{loc.members}</p>
                <p className="text-gray-500">People</p>
              </div>
            </div>

            {/* Departments within this location */}
            <div className="mt-3 space-y-1">
              {departments.filter((d) => d.parentName === loc.name).map((dept) => (
                <div key={dept.name} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[dept.status]}`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{dept.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{dept.avgMood ?? "—"}%</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {data.length === 0 && (
        <Card>
          <EmptyState
            icon={<Activity className="w-16 h-16" />}
            title="Heatmap is waiting on data"
            description="Once you add locations and employees, this view will show wellness scores by department in red/yellow/green so you can spot at-risk teams at a glance — without seeing any individual data."
          />
        </Card>
      )}
    </div>
  );
}
