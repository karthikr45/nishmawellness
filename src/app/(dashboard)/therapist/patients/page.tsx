"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, Calendar, MessageSquare } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

interface Appointment {
  id: string;
  dateTime: string;
  status: string;
  patient: { id: string; name: string; email: string };
}

interface PatientInfo {
  id: string;
  name: string;
  email: string;
  sessionCount: number;
  lastSession: string;
}

export default function TherapistPatients() {
  const { status } = useSession();
  const [patients, setPatients] = useState<PatientInfo[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/appointments")
        .then((r) => r.json())
        .then((appointments: Appointment[]) => {
          const patientMap = new Map<string, PatientInfo>();
          appointments.forEach((apt) => {
            const existing = patientMap.get(apt.patient.id);
            if (existing) {
              existing.sessionCount++;
              if (new Date(apt.dateTime) > new Date(existing.lastSession)) {
                existing.lastSession = apt.dateTime;
              }
            } else {
              patientMap.set(apt.patient.id, {
                id: apt.patient.id,
                name: apt.patient.name,
                email: apt.patient.email,
                sessionCount: 1,
                lastSession: apt.dateTime,
              });
            }
          });
          setPatients(Array.from(patientMap.values()));
        })
        .catch(console.error);
    }
  }, [status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
        <p className="text-gray-500 mt-1">{patients.length} patients</p>
      </div>

      {patients.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No patients yet</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <Card key={patient.id} hover className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium text-lg">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-500">{patient.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{patient.sessionCount} sessions</span>
                <span>Last: {new Date(patient.lastSession).toLocaleDateString()}</span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-1" /> Message
                </Button>
                <Button size="sm" className="flex-1">View Details</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
