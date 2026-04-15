"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, Send, Search, Upload, Download, CheckCircle, Clock } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";
import EmptyState from "@/components/ui/empty-state";

interface Member {
  id: string;
  role: string;
  employeeId?: string;
  designation?: string;
  sessionsUsed: number;
  sessionsAllowed: number;
  isActive: boolean;
  joinedAt: string;
  user: { id: string; name: string; email: string };
  location?: { id: string; name: string };
  department?: { id: string; name: string };
}

export default function EmployeesPage() {
  const { status } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("EMPLOYEE");
  const [bulkEmails, setBulkEmails] = useState("");
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/company")
        .then((r) => r.json())
        .then((data) => {
          const id = data?.organization?.id || data?.id || (Array.isArray(data) ? data[0]?.id : null);
          if (id) {
            setOrgId(id);
            fetch(`/api/company/members?orgId=${id}`).then((r) => r.json()).then(setMembers).catch(console.error);
          }
        })
        .catch(console.error);
    }
  }, [status]);

  const invite = async () => {
    if (!orgId || !inviteEmail) return;
    setSaving(true);
    await fetch("/api/company/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: orgId, email: inviteEmail, role: inviteRole }),
    });
    setShowInvite(false);
    setInviteEmail("");
    // Refresh
    const res = await fetch(`/api/company/members?orgId=${orgId}`);
    setMembers(await res.json());
    setSaving(false);
  };

  const bulkInvite = async () => {
    if (!orgId || !bulkEmails) return;
    setSaving(true);
    const emails = bulkEmails.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean);
    await fetch("/api/company/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: orgId,
        members: emails.map((email) => ({ email, role: "EMPLOYEE" })),
      }),
    });
    setShowBulk(false);
    setBulkEmails("");
    const res = await fetch(`/api/company/members?orgId=${orgId}`);
    setMembers(await res.json());
    setSaving(false);
  };

  const filtered = members.filter((m) =>
    m.user.name.toLowerCase().includes(search.toLowerCase()) ||
    m.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    ORG_ADMIN: "bg-red-100 text-red-700",
    HR_MANAGER: "bg-purple-100 text-purple-700",
    DEPT_HEAD: "bg-blue-100 text-blue-700",
    MANAGER: "bg-green-100 text-green-700",
    EMPLOYEE: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="text-gray-500 mt-1">{members.length} members</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowBulk(true)}>
            <Upload className="w-4 h-4 mr-2" /> Bulk Add
          </Button>
          <Button onClick={() => setShowInvite(true)}>
            <Send className="w-4 h-4 mr-2" /> Invite
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search by name or email..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 w-full md:w-80" />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Employee</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Location</th>
              <th className="px-6 py-3 font-medium">Department</th>
              <th className="px-6 py-3 font-medium">Sessions</th>
              <th className="px-6 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {m.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{m.user.name}</p>
                      <p className="text-xs text-gray-500">{m.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><Badge className={roleColors[m.role] || ""}>{m.role}</Badge></td>
                <td className="px-6 py-4 text-gray-500">{m.location?.name || "—"}</td>
                <td className="px-6 py-4 text-gray-500">{m.department?.name || "—"}</td>
                <td className="px-6 py-4 text-gray-500">{m.sessionsUsed}/{m.sessionsAllowed}</td>
                <td className="px-6 py-4 text-gray-500">{new Date(m.joinedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title="No employees yet"
            description="Invite your team via the buttons above. Once they accept, they appear here with anonymised session usage and join date — never their personal wellness data."
          />
        )}
      </Card>

      {/* Single Invite Modal */}
      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Invite Employee">
        <div className="space-y-4">
          <Input label="Email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="employee@company.com" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="HR_MANAGER">HR Manager</option>
              <option value="DEPT_HEAD">Department Head</option>
              <option value="ORG_ADMIN">Company Admin</option>
            </select>
          </div>
          <Button onClick={invite} loading={saving} className="w-full" disabled={!inviteEmail}>
            <Send className="w-4 h-4 mr-2" /> Send Invite
          </Button>
        </div>
      </Modal>

      {/* Bulk Add Modal */}
      <Modal isOpen={showBulk} onClose={() => setShowBulk(false)} title="Bulk Add Employees">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Addresses (one per line or comma-separated)
            </label>
            <textarea rows={6} value={bulkEmails} onChange={(e) => setBulkEmails(e.target.value)}
              placeholder="john@company.com&#10;jane@company.com&#10;mike@company.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 font-mono text-sm" />
          </div>
          <p className="text-xs text-gray-400">
            {bulkEmails.split(/[\n,]+/).filter((e) => e.trim()).length} emails detected.
            Non-registered users will receive an invite.
          </p>
          <Button onClick={bulkInvite} loading={saving} className="w-full" disabled={!bulkEmails.trim()}>
            <Upload className="w-4 h-4 mr-2" /> Add All Employees
          </Button>
        </div>
      </Modal>
    </div>
  );
}
