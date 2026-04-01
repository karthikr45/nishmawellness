"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Mic, Send, Brain, Clock, MessageSquare,
  Keyboard, Volume2, Settings, Phone,
} from "lucide-react";
import AvatarTherapist from "@/components/avatar/avatar-therapist";
import VoiceControls from "@/components/avatar/voice-controls";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import { getTTS } from "@/lib/tts";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Segment {
  text: string;
  mood: string;
  pause?: number;
}

export default function AvatarSessionPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatarMood, setAvatarMood] = useState<"neutral" | "empathetic" | "encouraging" | "thoughtful" | "greeting">("greeting");
  const [currentSpokenText, setCurrentSpokenText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ttsRef = useRef(typeof window !== "undefined" ? getTTS() : null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Session timer
  useEffect(() => {
    if (!sessionStarted) return;
    const timer = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [sessionStarted]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const speakSegments = async (segments: Segment[]) => {
    setIsSpeaking(true);

    for (const segment of segments) {
      setAvatarMood(segment.mood as typeof avatarMood);
      setCurrentSpokenText(segment.text);

      // Use browser TTS
      if (ttsRef.current) {
        await ttsRef.current.speak({
          text: segment.text,
          rate: 0.9,
          pitch: 1.05,
          onStart: () => setIsSpeaking(true),
          onEnd: () => {},
        });
      } else {
        // Fallback: simulate speaking duration
        await new Promise((r) => setTimeout(r, segment.text.length * 50));
      }

      // Pause between segments
      if (segment.pause) {
        await new Promise((r) => setTimeout(r, segment.pause));
      }
    }

    setIsSpeaking(false);
    setCurrentSpokenText("");
    setAvatarMood("neutral");
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;
    setIsProcessing(true);

    if (!sessionStarted) setSessionStarted(true);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("/api/avatar-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });
      const data = await res.json();

      if (!sessionId) setSessionId(data.sessionId);

      const aiMsg: ChatMessage = {
        id: data.message.id,
        role: "assistant",
        content: data.message.content,
        createdAt: data.message.createdAt,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Speak the response with avatar animation
      await speakSegments(data.segments);
    } catch (err) {
      console.error(err);
    }

    setIsProcessing(false);
  };

  const stopSpeaking = () => {
    if (ttsRef.current) ttsRef.current.stop();
    setIsSpeaking(false);
    setCurrentSpokenText("");
  };

  const endSession = () => {
    stopSpeaking();
    setSessionStarted(false);
    setElapsed(0);
  };

  // Initial greeting screen
  if (!sessionStarted) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="text-center max-w-lg">
          <AvatarTherapist isSpeaking={false} mood="greeting" />

          <div className="mt-8 space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">AI Avatar Therapy Session</h1>
            <p className="text-gray-500">
              Meet Dr. Nishma, your AI wellness therapist. Speak naturally or type —
              she&apos;ll respond with voice and facial expressions, just like a real session.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mt-6">
              {[
                "I've been feeling anxious lately",
                "I need help managing stress",
                "I want to improve my sleep",
                "Hello, this is my first time",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-4 py-2 bg-white border rounded-full text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center space-x-3 mt-6">
              <Button onClick={() => sendMessage("Hello, I'd like to start a session")} size="lg">
                <Mic className="w-5 h-5 mr-2" /> Start Session
              </Button>
              <Button variant="outline" onClick={() => { setInputMode("text"); setSessionStarted(true); }}>
                <Keyboard className="w-5 h-5 mr-2" /> Text Mode
              </Button>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-gray-400">
            <span className="flex items-center"><Volume2 className="w-3 h-3 mr-1" /> Voice enabled</span>
            <span className="flex items-center"><Brain className="w-3 h-3 mr-1" /> Memory-powered AI</span>
            <span className="flex items-center"><MessageSquare className="w-3 h-3 mr-1" /> Confidential</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-4">
      {/* Avatar Panel */}
      <div className="lg:w-1/2 flex flex-col">
        <Card className="flex-1 flex flex-col items-center justify-center p-6 relative">
          {/* Session header */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">Live Session</span>
              <span className="text-xs text-gray-400 flex items-center ml-2">
                <Clock className="w-3 h-3 mr-1" /> {formatTime(elapsed)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setInputMode(inputMode === "voice" ? "text" : "voice")}
                className={`p-2 rounded-lg text-xs flex items-center space-x-1 ${
                  inputMode === "voice" ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {inputMode === "voice" ? <Mic className="w-3 h-3" /> : <Keyboard className="w-3 h-3" />}
                <span>{inputMode === "voice" ? "Voice" : "Text"}</span>
              </button>
              <button onClick={endSession} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200">
                <Phone className="w-3 h-3 rotate-[135deg]" />
              </button>
            </div>
          </div>

          {/* Avatar */}
          <div className="mt-8">
            <AvatarTherapist isSpeaking={isSpeaking} mood={avatarMood} />
          </div>

          {/* Currently speaking text */}
          {currentSpokenText && (
            <div className="mt-4 px-6 py-3 bg-gray-50 rounded-2xl max-w-md text-center">
              <p className="text-sm text-gray-700 leading-relaxed">{currentSpokenText}</p>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && !isSpeaking && (
            <div className="mt-4 flex items-center space-x-2 text-gray-400">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <span className="text-xs ml-2">Thinking...</span>
            </div>
          )}

          {/* Voice or Text Input */}
          <div className="mt-auto pt-6 w-full">
            {inputMode === "voice" ? (
              <VoiceControls
                onSpeechResult={sendMessage}
                onSpeakText={async () => {}}
                isSpeaking={isSpeaking}
                onStopSpeaking={stopSpeaking}
              />
            ) : (
              <div className="flex space-x-3 max-w-md mx-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  disabled={isProcessing || isSpeaking}
                />
                <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isProcessing}>
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Chat Transcript Panel */}
      <div className="lg:w-1/2 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900 text-sm">Session Transcript</h2>
            </div>
            <span className="text-xs text-gray-400">{messages.length} messages</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Your conversation will appear here</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-4 ${
                  msg.role === "user"
                    ? "chat-bubble-user bg-primary-600 text-white"
                    : "chat-bubble-ai bg-gray-100 text-gray-800"
                }`}>
                  {msg.role === "assistant" && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-5 h-5 gradient-bg rounded-full flex items-center justify-center">
                        <Brain className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">Dr. Nishma</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-2 ${msg.role === "user" ? "text-white/60" : "text-gray-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t bg-gray-50">
            <p className="text-xs text-gray-400 text-center">
              AI wellness support — not a replacement for professional therapy.
              In crisis, call 988.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
