"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Clock, Save } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TherapistAvailability() {
  const { status } = useSession();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    DAYS.map((_, i) => ({
      dayOfWeek: i,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: i >= 1 && i <= 5,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/therapist/availability")
        .then((r) => r.json())
        .then((data: AvailabilitySlot[]) => {
          if (data.length > 0) {
            setAvailability((prev) =>
              prev.map((slot) => {
                const found = data.find((d) => d.dayOfWeek === slot.dayOfWeek);
                return found || slot;
              })
            );
          }
        })
        .catch(console.error);
    }
  }, [status]);

  const updateSlot = (dayOfWeek: number, field: string, value: string | boolean) => {
    setAvailability((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s))
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/therapist/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: availability.filter((a) => a.isAvailable) }),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="text-gray-500 mt-1">Set your weekly schedule for patient bookings</p>
        </div>
        <Button onClick={save} loading={saving}>
          <Save className="w-4 h-4 mr-2" /> Save Schedule
        </Button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          Availability saved successfully!
        </div>
      )}

      <Card className="p-6">
        <div className="space-y-4">
          {DAYS.map((day, index) => {
            const slot = availability.find((a) => a.dayOfWeek === index)!;
            return (
              <div key={day} className={`flex items-center space-x-4 p-4 rounded-xl ${slot.isAvailable ? "bg-green-50" : "bg-gray-50"}`}>
                <label className="flex items-center space-x-3 w-40">
                  <input
                    type="checkbox"
                    checked={slot.isAvailable}
                    onChange={(e) => updateSlot(index, "isAvailable", e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className={`font-medium ${slot.isAvailable ? "text-gray-900" : "text-gray-400"}`}>{day}</span>
                </label>
                {slot.isAvailable && (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
