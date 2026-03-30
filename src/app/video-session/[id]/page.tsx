"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Video, Mic, MicOff, VideoOff, Phone, MessageSquare,
  Monitor, Settings, Users, Clock,
} from "lucide-react";
import Button from "@/components/ui/button";

export default function VideoSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ from: string; text: string; time: string }[]>([
    { from: "System", text: "Session started. Your conversation is private and encrypted.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    // Simulate connection
    const connectTimer = setTimeout(() => setConnected(true), 2000);
    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (!connected) return;
    const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [connected]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { from: session?.user?.name || "You", text: chatInput, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setChatInput("");
  };

  const endCall = () => {
    if (confirm("Are you sure you want to end this session?")) {
      router.push(session?.user?.role === "THERAPIST" ? "/therapist/appointments" : "/patient/appointments");
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-white text-sm font-medium">
            {connected ? "Connected" : "Connecting..."}
          </span>
          <span className="text-gray-400 text-sm flex items-center">
            <Clock className="w-4 h-4 mr-1" /> {formatTime(elapsed)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-xs">Session ID: {id.slice(0, 8)}</span>
          <div className="flex items-center space-x-1 text-gray-400">
            <Users className="w-4 h-4" />
            <span className="text-sm">2</span>
          </div>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 flex relative">
        {/* Main video */}
        <div className={`flex-1 flex items-center justify-center ${chatOpen ? "mr-80" : ""} transition-all`}>
          <div className="relative w-full h-full bg-gray-800 flex items-center justify-center">
            {connected ? (
              <div className="text-center">
                <div className="w-32 h-32 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-16 h-16 text-white" />
                </div>
                <p className="text-white text-xl font-medium">
                  {session?.user?.role === "THERAPIST" ? "Patient" : "Therapist"} Video Feed
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Video streaming is simulated in this demo
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-white text-lg">Connecting to session...</p>
              </div>
            )}

            {/* Self video (pip) */}
            <div className="absolute bottom-6 right-6 w-48 h-36 bg-gray-700 rounded-2xl overflow-hidden border-2 border-gray-600 flex items-center justify-center">
              {videoOn ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto text-white font-medium">
                    {session?.user?.name?.charAt(0) || "Y"}
                  </div>
                  <p className="text-white text-xs mt-2">You</p>
                </div>
              ) : (
                <div className="text-center">
                  <VideoOff className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-gray-400 text-xs mt-1">Camera Off</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat sidebar */}
        {chatOpen && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-medium">Session Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i}>
                  <p className="text-xs text-gray-400">{msg.from} &middot; {msg.time}</p>
                  <p className="text-sm text-white mt-1">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg text-sm focus:ring-1 focus:ring-primary-500 border-0"
                />
                <button onClick={sendChat} className="p-2 bg-primary-600 rounded-lg text-white hover:bg-primary-700">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 py-6 bg-gray-800">
        <button
          onClick={() => setMicOn(!micOn)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            micOn ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-red-600 hover:bg-red-500 text-white"
          }`}
        >
          {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button
          onClick={() => setVideoOn(!videoOn)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            videoOn ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-red-600 hover:bg-red-500 text-white"
          }`}
        >
          {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <button className="w-14 h-14 rounded-full bg-gray-600 hover:bg-gray-500 text-white flex items-center justify-center">
          <Monitor className="w-6 h-6" />
        </button>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            chatOpen ? "bg-primary-600 text-white" : "bg-gray-600 hover:bg-gray-500 text-white"
          }`}
        >
          <MessageSquare className="w-6 h-6" />
        </button>

        <button className="w-14 h-14 rounded-full bg-gray-600 hover:bg-gray-500 text-white flex items-center justify-center">
          <Settings className="w-6 h-6" />
        </button>

        <button
          onClick={endCall}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center ml-4"
        >
          <Phone className="w-6 h-6 rotate-[135deg]" />
        </button>
      </div>
    </div>
  );
}
