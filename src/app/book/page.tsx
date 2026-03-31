"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  Star, Clock, Calendar, CheckCircle, Video,
  DollarSign, ArrowRight, Search,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";

interface Therapist {
  id: string;
  name: string;
  bio: string;
  specialization: string;
  experience: number;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  availability: { dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }[];
  matchScore?: number;
  matchReasons?: string[];
}

export default function BookPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ date: "", time: "", duration: "60", type: "VIDEO", notes: "" });
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    // Use therapist-match API for logged-in users (personalized matching)
    // Falls back to regular therapists API for guests
    const endpoint = session ? "/api/therapist-match" : "/api/users/therapists";
    fetch(endpoint).then((r) => r.json()).then(setTherapists).catch(console.error);
  }, [session]);

  const filteredTherapists = therapists.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const bookAppointment = async () => {
    if (!session) { router.push("/login"); return; }
    if (!selectedTherapist || !bookingForm.date || !bookingForm.time) return;

    setBooking(true);
    try {
      const dateTime = new Date(`${bookingForm.date}T${bookingForm.time}`).toISOString();
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId: selectedTherapist.id,
          dateTime,
          duration: parseInt(bookingForm.duration),
          type: bookingForm.type,
          notes: bookingForm.notes,
        }),
      });

      if (res.ok) {
        setBooked(true);
        setTimeout(() => { setShowModal(false); setBooked(false); router.push("/patient/appointments"); }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
    setBooking(false);
  };

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-16 bg-gradient-to-b from-secondary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book a Therapy Session</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the right therapist and schedule a session that works for you
          </p>
          <div className="max-w-md mx-auto mt-8 relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTherapists.map((therapist) => (
            <Card key={therapist.id} hover className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {therapist.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{therapist.name}</h3>
                    {therapist.matchScore && (
                      <Badge variant="success" className="text-xs">{therapist.matchScore}% Match</Badge>
                    )}
                  </div>
                  <p className="text-sm text-primary-600 font-medium">{therapist.specialization}</p>
                  {therapist.matchReasons && therapist.matchReasons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {therapist.matchReasons.slice(0, 2).map((reason, i) => (
                        <span key={i} className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{reason}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      {typeof therapist.rating === "number" ? therapist.rating.toFixed(1) : "4.8"}
                    </span>
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{therapist.experience} years</span>
                    <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" />${therapist.hourlyRate}/hr</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">{therapist.bio}</p>

                  <div className="flex items-center space-x-2 mt-3">
                    <span className="text-xs text-gray-400">Available:</span>
                    {therapist.availability?.filter((a) => a.isAvailable).map((a) => (
                      <Badge key={a.dayOfWeek} variant="success" className="text-xs">
                        {DAYS[a.dayOfWeek]}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4">
                    <Button
                      onClick={() => { setSelectedTherapist(therapist); setShowModal(true); }}
                    >
                      <Calendar className="w-4 h-4 mr-2" /> Book Session
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTherapists.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No therapists found</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setBooked(false); }} title={`Book with ${selectedTherapist?.name}`} size="lg">
        {booked ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Session Booked!</h3>
            <p className="text-gray-500">Redirecting to your appointments...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={bookingForm.date}
                  onChange={(e) => setBookingForm((p) => ({ ...p, date: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select value={bookingForm.time}
                  onChange={(e) => setBookingForm((p) => ({ ...p, time: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                  <option value="">Select time</option>
                  {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select value={bookingForm.duration}
                  onChange={(e) => setBookingForm((p) => ({ ...p, duration: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                <select value={bookingForm.type}
                  onChange={(e) => setBookingForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                  <option value="VIDEO">Video Call</option>
                  <option value="IN_PERSON">In Person</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea rows={3} value={bookingForm.notes}
                onChange={(e) => setBookingForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Anything you'd like your therapist to know beforehand..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Session Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${selectedTherapist ? ((selectedTherapist.hourlyRate / 60) * parseInt(bookingForm.duration || "60")).toFixed(0) : 0}
                </p>
              </div>
              <Button onClick={bookAppointment} loading={booking} size="lg">
                <Video className="w-5 h-5 mr-2" /> Confirm Booking <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </main>
  );
}
