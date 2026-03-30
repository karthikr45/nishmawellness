"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FileText, Plus, Calendar } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";

interface SessionNote {
  id: string;
  content: string;
  mood?: string;
  progress?: string;
  homework?: string;
  createdAt: string;
  appointment: {
    dateTime: string;
    patient: { name: string; email: string };
  };
}

interface Appointment {
  id: string;
  dateTime: string;
  status: string;
  patient: { name: string };
}

export default function TherapistNotes() {
  const { status } = useSession();
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ appointmentId: "", content: "", mood: "", progress: "", homework: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/sessions/notes").then((r) => r.json()).then(setNotes).catch(console.error);
      fetch("/api/appointments").then((r) => r.json()).then((data: Appointment[]) =>
        setAppointments(data.filter((a) => a.status === "COMPLETED"))
      ).catch(console.error);
    }
  }, [status]);

  const saveNote = async () => {
    setSaving(true);
    try {
      await fetch("/api/sessions/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setShowModal(false);
      setForm({ appointmentId: "", content: "", mood: "", progress: "", homework: "" });
      const res = await fetch("/api/sessions/notes");
      setNotes(await res.json());
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Session Notes</h1>
        <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4 mr-2" /> New Note</Button>
      </div>

      {notes.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No session notes yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{note.appointment.patient.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(note.appointment.dateTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Session Notes</p>
                  <p className="text-sm text-gray-700 mt-1">{note.content}</p>
                </div>
                {note.mood && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">Mood Assessment</p>
                    <p className="text-sm text-gray-700 mt-1">{note.mood}</p>
                  </div>
                )}
                {note.progress && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">Progress</p>
                    <p className="text-sm text-gray-700 mt-1">{note.progress}</p>
                  </div>
                )}
                {note.homework && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">Homework</p>
                    <p className="text-sm text-gray-700 mt-1">{note.homework}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Session Note" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
            <select
              value={form.appointmentId}
              onChange={(e) => setForm((p) => ({ ...p, appointmentId: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a completed session</option>
              {appointments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.patient.name} - {new Date(apt.dateTime).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={4} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              placeholder="Session observations and notes..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mood Assessment</label>
              <input type="text" value={form.mood} onChange={(e) => setForm((p) => ({ ...p, mood: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
              <input type="text" value={form.progress} onChange={(e) => setForm((p) => ({ ...p, progress: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Homework/Exercises</label>
            <textarea rows={2} value={form.homework} onChange={(e) => setForm((p) => ({ ...p, homework: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
          </div>
          <Button onClick={saveNote} loading={saving} className="w-full">Save Note</Button>
        </div>
      </Modal>
    </div>
  );
}
