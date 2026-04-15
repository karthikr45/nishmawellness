"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MapPin, Plus, Building2, ChevronRight } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";
import EmptyState from "@/components/ui/empty-state";

interface OrgData {
  id: string;
  name: string;
  locations: {
    id: string; name: string; type: string; city?: string;
    divisions: { id: string; name: string; departments: { id: string; name: string }[] }[];
  }[];
}

export default function LocationsPage() {
  const { status } = useSession();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [showAddLoc, setShowAddLoc] = useState(false);
  const [showAddDiv, setShowAddDiv] = useState<string | null>(null); // locationId
  const [showAddDept, setShowAddDept] = useState<string | null>(null); // divisionId
  const [locForm, setLocForm] = useState({ name: "", type: "OFFICE", city: "" });
  const [divName, setDivName] = useState("");
  const [deptName, setDeptName] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/company");
    const data = await res.json();
    const o = Array.isArray(data) ? data[0] : (data?.organization || data);
    if (o?.id) setOrg(o);
  };

  useEffect(() => { if (status === "authenticated") refresh(); }, [status]);

  const addLocation = async () => {
    if (!org) return;
    setSaving(true);
    await fetch("/api/company/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...locForm, organizationId: org.id }),
    });
    await refresh();
    setShowAddLoc(false);
    setLocForm({ name: "", type: "OFFICE", city: "" });
    setSaving(false);
  };

  const addDivision = async () => {
    if (!showAddDiv || !divName) return;
    setSaving(true);
    await fetch("/api/company/divisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId: showAddDiv, name: divName }),
    });
    await refresh();
    setShowAddDiv(null);
    setDivName("");
    setSaving(false);
  };

  const addDepartment = async () => {
    if (!showAddDept || !deptName) return;
    setSaving(true);
    await fetch("/api/company/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ divisionId: showAddDept, name: deptName }),
    });
    await refresh();
    setShowAddDept(null);
    setDeptName("");
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Locations & Structure</h1>
          <p className="text-gray-500 mt-1">Manage your offices, branches, and departments</p>
        </div>
        <Button onClick={() => setShowAddLoc(true)}><Plus className="w-4 h-4 mr-2" /> Add Location</Button>
      </div>

      {org?.locations.length === 0 && (
        <Card>
          <EmptyState
            icon={<MapPin className="w-16 h-16" />}
            title="No locations yet"
            description="Add your offices, branches, plants, hospitals, stores, or campuses. Each location can have divisions and departments — useful for breaking down anonymous wellness analytics by team."
            action={
              <Button onClick={() => setShowAddLoc(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Your First Location
              </Button>
            }
          />
        </Card>
      )}

      {org?.locations.map((loc) => (
        <Card key={loc.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center text-primary-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{loc.name}</h3>
                <p className="text-xs text-gray-500">{loc.type} {loc.city ? `• ${loc.city}` : ""}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowAddDiv(loc.id)}>
              <Plus className="w-3 h-3 mr-1" /> Division
            </Button>
          </div>

          {loc.divisions.length === 0 ? (
            <p className="text-sm text-gray-400 ml-13 pl-13">No divisions yet. Add divisions like "Technology", "Operations", etc.</p>
          ) : (
            <div className="ml-6 space-y-3">
              {loc.divisions.map((div) => (
                <div key={div.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <p className="font-medium text-gray-900 dark:text-white">{div.name}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setShowAddDept(div.id)}>
                      <Plus className="w-3 h-3 mr-1" /> Department
                    </Button>
                  </div>
                  {div.departments.length > 0 && (
                    <div className="ml-6 flex flex-wrap gap-2">
                      {div.departments.map((dept) => (
                        <Badge key={dept.id} variant="info">{dept.name}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}

      {/* Add Location Modal */}
      <Modal isOpen={showAddLoc} onClose={() => setShowAddLoc(false)} title="Add Location">
        <div className="space-y-4">
          <Input label="Name" value={locForm.name} onChange={(e) => setLocForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Mumbai HQ" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={locForm.type} onChange={(e) => setLocForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                <option value="OFFICE">Office</option><option value="BRANCH">Branch</option>
                <option value="PLANT">Factory/Plant</option><option value="HOSPITAL">Hospital</option>
                <option value="STORE">Store</option><option value="CAMPUS">Campus</option>
              </select>
            </div>
            <Input label="City" value={locForm.city} onChange={(e) => setLocForm((p) => ({ ...p, city: e.target.value }))} />
          </div>
          <Button onClick={addLocation} loading={saving} className="w-full" disabled={!locForm.name}>Add Location</Button>
        </div>
      </Modal>

      {/* Add Division Modal */}
      <Modal isOpen={!!showAddDiv} onClose={() => setShowAddDiv(null)} title="Add Division" size="sm">
        <div className="space-y-4">
          <Input label="Division Name" value={divName} onChange={(e) => setDivName(e.target.value)}
            placeholder="e.g., Technology, Operations, Clinical" />
          <Button onClick={addDivision} loading={saving} className="w-full" disabled={!divName}>Add Division</Button>
        </div>
      </Modal>

      {/* Add Department Modal */}
      <Modal isOpen={!!showAddDept} onClose={() => setShowAddDept(null)} title="Add Department" size="sm">
        <div className="space-y-4">
          <Input label="Department Name" value={deptName} onChange={(e) => setDeptName(e.target.value)}
            placeholder="e.g., Engineering, Nursing, Accounts" />
          <Button onClick={addDepartment} loading={saving} className="w-full" disabled={!deptName}>Add Department</Button>
        </div>
      </Modal>
    </div>
  );
}
