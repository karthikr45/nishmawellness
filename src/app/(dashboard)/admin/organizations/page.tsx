"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Building2, Plus, Users, Calendar, TrendingUp,
  CheckCircle, Search, Shield, BarChart3,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";

interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  contactEmail: string;
  contactName: string;
  plan: string;
  maxEmployees: number;
  sessionsPerEmployee: number;
  industry?: string;
  size?: string;
  isActive: boolean;
  createdAt: string;
  _count: { members: number };
}

export default function AdminOrganizations() {
  const { status } = useSession();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", domain: "", contactEmail: "", contactName: "",
    plan: "STANDARD", maxEmployees: "100", sessionsPerEmployee: "12",
    industry: "", size: "MEDIUM",
  });

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/organization").then((r) => r.json()).then(setOrgs).catch(console.error);
    }
  }, [status]);

  const createOrg = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxEmployees: parseInt(form.maxEmployees),
          sessionsPerEmployee: parseInt(form.sessionsPerEmployee),
        }),
      });
      if (res.ok) {
        const org = await res.json();
        setOrgs((prev) => [{ ...org, _count: { members: 0 } }, ...prev]);
        setShowModal(false);
        setForm({ name: "", slug: "", domain: "", contactEmail: "", contactName: "", plan: "STANDARD", maxEmployees: "100", sessionsPerEmployee: "12", industry: "", size: "MEDIUM" });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create organization");
      }
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const filtered = orgs.filter(
    (o) => o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  const planColors: Record<string, string> = {
    BASIC: "bg-gray-100 text-gray-700",
    STANDARD: "bg-blue-100 text-blue-700",
    PREMIUM: "bg-purple-100 text-purple-700",
    ENTERPRISE: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-500 mt-1">Manage corporate wellness clients</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Organization
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{orgs.length}</p>
              <p className="text-xs text-gray-500">Organizations</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{orgs.reduce((s, o) => s + o._count.members, 0)}</p>
              <p className="text-xs text-gray-500">Total Members</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{orgs.filter((o) => o.isActive).length}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{orgs.filter((o) => o.plan === "ENTERPRISE").length}</p>
              <p className="text-xs text-gray-500">Enterprise</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search organizations..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 w-64" />
      </div>

      {/* Org List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((org) => (
          <Card key={org.id} hover className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {org.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{org.name}</h3>
                  <p className="text-sm text-gray-500">{org.contactEmail}</p>
                </div>
              </div>
              <Badge className={planColors[org.plan] || ""}>{org.plan}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-bold text-gray-900">{org._count.members}</p>
                <p className="text-xs text-gray-500">Members</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-bold text-gray-900">{org.maxEmployees}</p>
                <p className="text-xs text-gray-500">Max Seats</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-bold text-gray-900">{org.sessionsPerEmployee}</p>
                <p className="text-xs text-gray-500">Sessions/yr</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                {org.industry && <Badge variant="default">{org.industry}</Badge>}
                <Badge variant={org.isActive ? "success" : "danger"}>
                  {org.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Button size="sm" variant="outline">
                <BarChart3 className="w-4 h-4 mr-1" /> Analytics
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">{search ? "No organizations match your search" : "No organizations yet"}</p>
        </Card>
      )}

      {/* Create Org Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Organization" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Organization Name" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") }))} />
            <Input label="Slug" value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
          </div>
          <Input label="Email Domain (for SSO matching)" placeholder="company.com" value={form.domain}
            onChange={(e) => setForm((p) => ({ ...p, domain: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact Name" value={form.contactName}
              onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} />
            <Input label="Contact Email" type="email" value={form.contactEmail}
              onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select value={form.plan} onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                <option value="BASIC">Basic</option>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
            <Input label="Max Employees" type="number" value={form.maxEmployees}
              onChange={(e) => setForm((p) => ({ ...p, maxEmployees: e.target.value }))} />
            <Input label="Sessions/Employee/Year" type="number" value={form.sessionsPerEmployee}
              onChange={(e) => setForm((p) => ({ ...p, sessionsPerEmployee: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Industry" placeholder="Technology, Healthcare, etc." value={form.industry}
              onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
              <select value={form.size} onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                <option value="SMALL">Small (1-50)</option>
                <option value="MEDIUM">Medium (51-200)</option>
                <option value="LARGE">Large (201-1000)</option>
                <option value="ENTERPRISE">Enterprise (1000+)</option>
              </select>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
            <p className="font-medium mb-1">Privacy by Default</p>
            <p>All employee data is anonymized. The organization can only see aggregated wellness metrics, never individual data.</p>
          </div>
          <Button onClick={createOrg} loading={saving} className="w-full">
            <CheckCircle className="w-4 h-4 mr-2" /> Create Organization
          </Button>
        </div>
      </Modal>
    </div>
  );
}
