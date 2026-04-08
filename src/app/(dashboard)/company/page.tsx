"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Building2, Users, MapPin, TrendingUp, Heart,
  Calendar, BarChart3, Plus, Shield, DollarSign,
  Copy, CheckCircle, Send, FileText, Award,
  AlertTriangle, MessageSquare, Target,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";

interface OrgData {
  id: string;
  name: string;
  slug: string;
  industry: string;
  plan: string;
  joinCode: string;
  maxEmployees: number;
  sessionsPerEmployee: number;
  _count: { members: number };
  locations: {
    id: string;
    name: string;
    type: string;
    city: string;
    divisions: {
      id: string;
      name: string;
      departments: { id: string; name: string }[];
    }[];
  }[];
}

export default function CompanyDashboard() {
  const { status } = useSession();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const [orgForm, setOrgForm] = useState({ name: "", industry: "IT", size: "MEDIUM", country: "IN", currency: "INR", maxEmployees: "100" });
  const [locationForm, setLocationForm] = useState({ name: "", type: "OFFICE", city: "", state: "", country: "" });
  const [inviteForm, setInviteForm] = useState({ email: "", role: "EMPLOYEE" });
  const [feedbacks, setFeedbacks] = useState<{ id: string; category: string; message: string; severity: string; status: string; createdAt: string }[]>([]);
  const [feedbackStats, setFeedbackStats] = useState({ total: 0, new: 0, critical: 0, resolved: 0 });

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/company")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setOrg(data[0]);
          else if (data && data.id) setOrg(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  useEffect(() => {
    if (org) {
      fetch(`/api/company/feedback?orgId=${org.id}`)
        .then((r) => r.json())
        .then((d) => { setFeedbacks(d.feedbacks || []); setFeedbackStats(d.stats || {}); })
        .catch(console.error);
    }
  }, [org]);

  const createOrg = async () => {
    setSaving(true);
    const res = await fetch("/api/company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...orgForm, maxEmployees: parseInt(orgForm.maxEmployees) }),
    });
    const data = await res.json();
    setOrg({ ...data, locations: [], _count: { members: 1 } });
    setShowCreateOrg(false);
    setSaving(false);
  };

  const addLocation = async () => {
    if (!org) return;
    setSaving(true);
    await fetch("/api/company/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...locationForm, organizationId: org.id }),
    });
    // Refresh org
    const res = await fetch("/api/company");
    const data = await res.json();
    if (Array.isArray(data)) setOrg(data[0]);
    else setOrg(data);
    setShowAddLocation(false);
    setLocationForm({ name: "", type: "OFFICE", city: "", state: "", country: "" });
    setSaving(false);
  };

  const inviteMember = async () => {
    if (!org) return;
    setSaving(true);
    await fetch("/api/company/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...inviteForm, organizationId: org.id }),
    });
    setShowInvite(false);
    setInviteForm({ email: "", role: "EMPLOYEE" });
    setSaving(false);
  };

  const copyJoinCode = () => {
    if (org?.joinCode) {
      navigator.clipboard.writeText(org.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  // No org yet — show creation
  if (!org) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <div className="text-center mb-8">
          <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Set Up Your Company</h1>
          <p className="text-gray-500 max-w-md mx-auto">Create your company&apos;s wellness portal. Add locations, departments, and invite employees.</p>
        </div>
        <Card className="p-8">
          <div className="space-y-4">
            <Input label="Company Name" value={orgForm.name} onChange={(e) => setOrgForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Acme Corporation" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select value={orgForm.industry} onChange={(e) => setOrgForm((p) => ({ ...p, industry: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                  <option value="IT">IT / Software</option>
                  <option value="BANKING">Banking / Finance</option>
                  <option value="HEALTHCARE">Healthcare</option>
                  <option value="MANUFACTURING">Manufacturing</option>
                  <option value="RETAIL">Retail</option>
                  <option value="EDUCATION">Education</option>
                  <option value="GOVERNMENT">Government</option>
                  <option value="BPO">BPO / Services</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                <select value={orgForm.size} onChange={(e) => setOrgForm((p) => ({ ...p, size: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                  <option value="STARTUP">Startup (1-50)</option>
                  <option value="SMALL">Small (51-200)</option>
                  <option value="MEDIUM">Medium (201-1000)</option>
                  <option value="LARGE">Large (1001-5000)</option>
                  <option value="ENTERPRISE">Enterprise (5000+)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select value={orgForm.country} onChange={(e) => setOrgForm((p) => ({ ...p, country: e.target.value, currency: e.target.value === "IN" ? "INR" : "USD" }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="SG">Singapore</option>
                  <option value="AE">UAE</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <Input label="Max Employees" type="number" value={orgForm.maxEmployees} onChange={(e) => setOrgForm((p) => ({ ...p, maxEmployees: e.target.value }))} />
            </div>
            <div className="p-4 bg-green-50 rounded-xl flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">Employee data is always anonymized. HR and management see only aggregate wellness metrics.</p>
            </div>
            <Button onClick={createOrg} loading={saving} className="w-full" size="lg" disabled={!orgForm.name}>
              <Building2 className="w-5 h-5 mr-2" /> Create Company Portal
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Company Dashboard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{org.name}</h1>
          <p className="text-gray-500 mt-1">{org.industry} &middot; <Badge>{org.plan}</Badge></p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowInvite(true)}><Send className="w-4 h-4 mr-2" /> Invite</Button>
          <Button onClick={() => setShowAddLocation(true)}><Plus className="w-4 h-4 mr-2" /> Add Location</Button>
        </div>
      </div>

      {/* Join Code */}
      <Card className="p-4 flex items-center justify-between bg-primary-50 dark:bg-primary-950">
        <div className="flex items-center space-x-3">
          <Shield className="w-5 h-5 text-primary-600" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Employee Join Code</p>
            <p className="text-xs text-gray-500">Employees enter this code to self-register</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <code className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg font-mono text-lg font-bold text-primary-600 tracking-wider">{org.joinCode}</code>
          <Button size="sm" variant="outline" onClick={copyJoinCode}>
            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Employees", value: org._count.members, max: org.maxEmployees, icon: <Users className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
          { label: "Locations", value: org.locations.length, icon: <MapPin className="w-5 h-5" />, color: "bg-green-100 text-green-600" },
          { label: "Departments", value: org.locations.reduce((s, l) => s + l.divisions.reduce((s2, d) => s2 + d.departments.length, 0), 0), icon: <Building2 className="w-5 h-5" />, color: "bg-purple-100 text-purple-600" },
          { label: "Feedback", value: feedbackStats.new, icon: <MessageSquare className="w-5 h-5" />, color: feedbackStats.new > 0 ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-600" },
          { label: "Sessions/Employee", value: org.sessionsPerEmployee, icon: <Calendar className="w-5 h-5" />, color: "bg-orange-100 text-orange-600" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color} mb-2`}>{s.icon}</div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}{s.max ? `/${s.max}` : ""}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Org Structure */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Company Structure</h2>
          <Button size="sm" variant="outline" onClick={() => setShowAddLocation(true)}><Plus className="w-4 h-4 mr-1" /> Location</Button>
        </div>
        {org.locations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No locations added yet. Add your first office/branch.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {org.locations.map((loc) => (
              <div key={loc.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{loc.name}</p>
                    <p className="text-xs text-gray-500">{loc.type} {loc.city ? `• ${loc.city}` : ""}</p>
                  </div>
                </div>
                {loc.divisions.length > 0 && (
                  <div className="ml-8 space-y-2">
                    {loc.divisions.map((div) => (
                      <div key={div.id}>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{div.name}</p>
                        {div.departments.length > 0 && (
                          <div className="ml-4 flex flex-wrap gap-1 mt-1">
                            {div.departments.map((dept) => (
                              <Badge key={dept.id} variant="default">{dept.name}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Anonymous Feedback */}
      {feedbacks.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" /> Anonymous Employee Feedback
            {feedbackStats.new > 0 && <Badge variant="warning" className="ml-2">{feedbackStats.new} new</Badge>}
          </h2>
          <div className="space-y-3">
            {feedbacks.slice(0, 5).map((fb) => (
              <div key={fb.id} className={`p-4 rounded-xl ${fb.severity === "CRITICAL" ? "bg-red-50 border-l-4 border-l-red-500" : "bg-gray-50"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant={fb.severity === "CRITICAL" ? "danger" : fb.severity === "HIGH" ? "warning" : "default"}>{fb.severity}</Badge>
                    <Badge>{fb.category.replace("_", " ")}</Badge>
                  </div>
                  <Badge variant={fb.status === "NEW" ? "info" : fb.status === "RESOLVED" ? "success" : "default"}>{fb.status}</Badge>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{fb.message}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(fb.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "View Analytics", icon: <BarChart3 className="w-6 h-6" />, desc: "Wellness heatmap & metrics", color: "text-blue-600" },
          { label: "Wellness Challenge", icon: <Target className="w-6 h-6" />, desc: "Start a company challenge", color: "text-green-600" },
          { label: "Pulse Survey", icon: <FileText className="w-6 h-6" />, desc: "Send quick wellness check", color: "text-purple-600" },
          { label: "ROI Report", icon: <DollarSign className="w-6 h-6" />, desc: "Wellness ROI calculator", color: "text-orange-600" },
        ].map((a) => (
          <Card key={a.label} hover className="p-5 text-center cursor-pointer">
            <div className={`${a.color} flex justify-center mb-3`}>{a.icon}</div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{a.label}</p>
            <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
          </Card>
        ))}
      </div>

      {/* Add Location Modal */}
      <Modal isOpen={showAddLocation} onClose={() => setShowAddLocation(false)} title="Add Location">
        <div className="space-y-4">
          <Input label="Location Name" value={locationForm.name} onChange={(e) => setLocationForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Mumbai HQ" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={locationForm.type} onChange={(e) => setLocationForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                <option value="OFFICE">Office</option>
                <option value="BRANCH">Branch</option>
                <option value="PLANT">Factory/Plant</option>
                <option value="HOSPITAL">Hospital/Clinic</option>
                <option value="STORE">Store/Outlet</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="CAMPUS">Campus</option>
              </select>
            </div>
            <Input label="City" value={locationForm.city} onChange={(e) => setLocationForm((p) => ({ ...p, city: e.target.value }))} />
          </div>
          <Button onClick={addLocation} loading={saving} className="w-full" disabled={!locationForm.name}>Add Location</Button>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Invite Employee">
        <div className="space-y-4">
          <Input label="Email" type="email" value={inviteForm.email} onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))} placeholder="employee@company.com" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={inviteForm.role} onChange={(e) => setInviteForm((p) => ({ ...p, role: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="HR_MANAGER">HR Manager</option>
              <option value="DEPT_HEAD">Department Head</option>
              <option value="UNIT_HEAD">Unit/Division Head</option>
              <option value="ORG_ADMIN">Company Admin</option>
            </select>
          </div>
          <p className="text-xs text-gray-400">If the user isn&apos;t registered, they&apos;ll receive an invite link.</p>
          <Button onClick={inviteMember} loading={saving} className="w-full" disabled={!inviteForm.email}>
            <Send className="w-4 h-4 mr-2" /> Send Invite
          </Button>
        </div>
      </Modal>
    </div>
  );
}
