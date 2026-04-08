"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertTriangle, CheckCircle, Clock, Shield, ArrowRight } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface Incident {
  id: string; type: string; severity: string; description: string; status: string;
  assignedTo?: string; actionsTaken: string; createdAt: string; resolvedAt?: string;
}

export default function IncidentsPage() {
  const { status } = useSession();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState({ total: 0, new: 0, critical: 0, resolved: 0 });

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/company").then((r) => r.json()).then((org) => {
        const id = Array.isArray(org) ? org[0]?.id : (org?.organization?.id || org?.id);
        if (id) fetch(`/api/company/incident?orgId=${id}`).then((r) => r.json())
          .then((d) => { setIncidents(d.incidents || []); setStats(d.stats || {}); });
      });
    }
  }, [status]);

  const resolve = async (id: string) => {
    await fetch("/api/company/incident", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "RESOLVED" }),
    });
    setIncidents((p) => p.map((i) => i.id === id ? { ...i, status: "RESOLVED" } : i));
  };

  const severityIcon = (s: string) => s === "CRITICAL" ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <Clock className="w-5 h-5 text-orange-500" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Critical Incidents</h1>
        <p className="text-gray-500 mt-1">Automated alerts from burnout prediction and crisis detection</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "bg-blue-100 text-blue-600" },
          { label: "New", value: stats.new, color: stats.new > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600" },
          { label: "Critical", value: stats.critical, color: stats.critical > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600" },
          { label: "Resolved", value: stats.resolved, color: "bg-green-100 text-green-600" },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </Card>
        ))}
      </div>

      {incidents.map((inc) => (
        <Card key={inc.id} className={`p-5 ${inc.severity === "CRITICAL" ? "border-l-4 border-l-red-500" : inc.severity === "HIGH" ? "border-l-4 border-l-orange-500" : ""}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {severityIcon(inc.severity)}
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant={inc.severity === "CRITICAL" ? "danger" : "warning"}>{inc.severity}</Badge>
                  <Badge>{inc.type.replace(/_/g, " ")}</Badge>
                  <Badge variant={inc.status === "RESOLVED" ? "success" : inc.status === "NEW" ? "danger" : "info"}>{inc.status}</Badge>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{inc.description}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(inc.createdAt).toLocaleString()}</p>
              </div>
            </div>
            {inc.status !== "RESOLVED" && (
              <Button size="sm" variant="outline" onClick={() => resolve(inc.id)}>
                <CheckCircle className="w-4 h-4 mr-1" /> Resolve
              </Button>
            )}
          </div>
        </Card>
      ))}

      {incidents.length === 0 && (
        <Card className="p-12 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-green-300" />
          <p className="text-gray-500">No critical incidents. Your organization is in good shape!</p>
        </Card>
      )}
    </div>
  );
}
