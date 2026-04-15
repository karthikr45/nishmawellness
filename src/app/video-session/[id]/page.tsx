"use client";

import { useState, useEffect, use, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import Button from "@/components/ui/button";

interface Appointment {
  id: string;
  status: string;
  type: string;
  dateTime: string;
  duration: number;
  patient: { id: string; name: string; email: string };
  therapist: { id: string; name: string; email: string };
}

// Jitsi External API global injected by their script
type JitsiAPI = {
  dispose: () => void;
  addListener: (event: string, fn: (data?: unknown) => void) => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
};

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (
      domain: string,
      options: Record<string, unknown>
    ) => JitsiAPI;
  }
}

const JITSI_DOMAIN = "meet.jit.si";
const JITSI_SCRIPT_URL = `https://${JITSI_DOMAIN}/external_api.js`;

export default function VideoSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiAPI | null>(null);

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Auth gate
  useEffect(() => {
    if (status === "unauthenticated") router.push(`/login?from=/video-session/${id}`);
  }, [status, router, id]);

  // Load appointment + verify access
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/appointments/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(data.error || "Could not load this session");
        }
        return r.json() as Promise<Appointment>;
      })
      .then((apt) => {
        setAppointment(apt);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, status]);

  // Inject Jitsi script once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.JitsiMeetExternalAPI) {
      setScriptLoaded(true);
      return;
    }
    const existing = document.querySelector(`script[src="${JITSI_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => setScriptLoaded(true));
      return;
    }
    const script = document.createElement("script");
    script.src = JITSI_SCRIPT_URL;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setError("Could not load video provider. Please refresh.");
    document.body.appendChild(script);
  }, []);

  // Mount the Jitsi room when both data + script are ready
  useEffect(() => {
    if (!scriptLoaded || !appointment || !containerRef.current || !session?.user) return;
    if (apiRef.current) return; // already mounted

    // Deterministic, unguessable room name from appointment UUID
    const roomName = `nishma-${appointment.id}`;

    const isTherapist = session.user.id === appointment.therapist.id;
    const displayName = session.user.name || (isTherapist ? "Therapist" : "Patient");
    const email = session.user.email || undefined;

    const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
      roomName,
      parentNode: containerRef.current,
      width: "100%",
      height: "100%",
      userInfo: { displayName, email },
      configOverwrite: {
        prejoinPageEnabled: true,
        disableDeepLinking: true,
        enableWelcomePage: false,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        DEFAULT_BACKGROUND: "#1a1832",
        TOOLBAR_BUTTONS: [
          "microphone", "camera", "desktop", "fullscreen",
          "fodeviceselection", "hangup", "chat", "settings",
          "raisehand", "videoquality", "tileview",
        ],
      },
    });

    apiRef.current = api;

    api.addListener("readyToClose", () => {
      // User clicked hang up
      const dest = isTherapist ? "/therapist/appointments" : "/patient/appointments";
      router.push(dest);
    });

    return () => {
      try {
        api.dispose();
      } catch {
        /* no-op */
      }
      apiRef.current = null;
    };
  }, [scriptLoaded, appointment, session, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1832]">
        <div className="text-center text-white">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary-400" />
          <p className="text-sm text-gray-400">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1832] p-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md text-center shadow-2xl">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-950 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cannot join session</h2>
          <p className="mt-2 text-gray-500">{error || "Session not found."}</p>
          <Link href="/patient/appointments" className="mt-6 inline-block">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Appointments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isTherapist = session?.user?.id === appointment.therapist.id;
  const otherPartyName = isTherapist ? appointment.patient.name : appointment.therapist.name;

  return (
    <div className="fixed inset-0 bg-[#1a1832] flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#141830] border-b border-white/10 text-white">
        <div className="flex items-center space-x-3">
          <Link
            href={isTherapist ? "/therapist/appointments" : "/patient/appointments"}
            className="text-gray-400 hover:text-white transition-colors flex items-center text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Leave
          </Link>
          <div className="h-5 w-px bg-white/10" />
          <div>
            <p className="text-sm font-semibold">Session with {otherPartyName}</p>
            <p className="text-xs text-gray-500">{appointment.duration} min &middot; secured by Jitsi</p>
          </div>
        </div>
        <a
          href={`https://${JITSI_DOMAIN}/nishma-${appointment.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-white transition-colors flex items-center"
        >
          Open in new tab <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>

      {/* Jitsi container */}
      <div ref={containerRef} className="flex-1 bg-[#1a1832]">
        {!scriptLoaded && (
          <div className="h-full flex items-center justify-center text-white">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary-400" />
              <p className="text-sm text-gray-400">Connecting to video...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
