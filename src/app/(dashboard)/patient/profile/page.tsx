"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Phone, Save } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  createdAt: string;
}

export default function PatientProfile() {
  const { status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/users/profile")
        .then((r) => r.json())
        .then((data: Profile) => {
          setProfile(data);
          setForm({ name: data.name, phone: data.phone || "", bio: data.bio || "" });
        })
        .catch(console.error);
    }
  }, [status]);

  const save = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (!profile) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
          <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {profile.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
            <p className="text-gray-500">{profile.email}</p>
            <p className="text-xs text-gray-400 mt-1">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input id="name" label="Full Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Input id="email" label="Email" value={profile.email} disabled />
          <Input id="phone" label="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {success && <p className="text-green-600 text-sm">Profile updated successfully!</p>}

          <Button onClick={save} loading={saving}>
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
