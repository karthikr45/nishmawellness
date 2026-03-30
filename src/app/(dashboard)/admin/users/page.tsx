"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, Search, Shield, ShieldOff } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  specialization?: string;
  isActive: boolean;
  createdAt: string;
  _count: { patientAppointments: number; therapistAppointments: number; enrollments: number };
}

export default function AdminUsers() {
  const { status } = useSession();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/users").then((r) => r.json()).then(setUsers).catch(console.error);
    }
  }, [status]);

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !isActive } : u)));
  };

  const filtered = users
    .filter((u) => filter === "ALL" || u.role === filter)
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex space-x-2">
          {["ALL", "PATIENT", "THERAPIST", "ADMIN"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-primary-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}s
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 w-64" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Activity</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === "ADMIN" ? "danger" : user.role === "THERAPIST" ? "info" : "default"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.isActive ? "success" : "danger"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {user.role === "THERAPIST"
                      ? `${user._count.therapistAppointments} sessions`
                      : `${user._count.patientAppointments} sessions, ${user._count.enrollments} programs`}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <Button size="sm" variant={user.isActive ? "danger" : "primary"} onClick={() => toggleActive(user.id, user.isActive)}>
                      {user.isActive ? <><ShieldOff className="w-3 h-3 mr-1" /> Deactivate</> : <><Shield className="w-3 h-3 mr-1" /> Activate</>}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
