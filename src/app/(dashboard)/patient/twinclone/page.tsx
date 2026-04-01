"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Brain, Send, ArrowLeft, Star, Clock, MessageSquare,
  Users, Sparkles, Plus,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface TherapistClone {
  therapistId: string;
  isActive: boolean;
  personality: string;
  approach: string;
  focusAreas: string[];
  therapist: { name: string; specialization: string; bio: string; experience: number };
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export default function PatientTwinClone() {
  const { status } = useSession();
  const [therapists, setTherapists] = useState<TherapistClone[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistClone | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "authenticated") {
      // Get all therapists with active TwinClones
      fetch("/api/users/therapists")
        .then((r) => r.json())
        .then(async (therapistList) => {
          const clones: TherapistClone[] = [];
          for (const t of therapistList) {
            try {
              const res = await fetch(`/api/twinclone?therapistId=${t.id}`);
              const profile = await res.json();
              if (profile.isActive !== false) {
                clones.push({
                  ...profile,
                  therapist: { name: t.name, specialization: t.specialization, bio: t.bio, experience: t.experience },
                });
              }
            } catch { /* skip */ }
          }
          setTherapists(clones);
        })
        .catch(console.error);
    }
  }, [status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectClone = (clone: TherapistClone) => {
    setSelectedTherapist(clone);
    setMessages([]);
    setSessionId(null);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending || !selectedTherapist) return;
    setSending(true);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`, role: "user", content: input, createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const text = input;
    setInput("");

    try {
      const res = await fetch("/api/twinclone/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId, therapistId: selectedTherapist.therapistId }),
      });
      const data = await res.json();
      if (!sessionId) setSessionId(data.sessionId);
      setMessages((prev) => [...prev, data.message]);
    } catch (err) { console.error(err); }
    setSending(false);
  };

  // Clone selection screen
  if (!selectedTherapist) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Choose Your AI Therapist</h1>
          <p className="text-gray-500 mt-1">Each AI clone is trained on a specific therapist&apos;s approach and style</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {therapists.map((clone) => (
            <Card key={clone.therapistId} hover className="p-6 cursor-pointer" onClick={() => selectClone(clone)}>
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 gradient-bg rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {clone.therapist.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">{clone.therapist.name}</h3>
                    <Badge variant="success" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" /> AI Clone
                    </Badge>
                  </div>
                  <p className="text-sm text-primary-600">{clone.therapist.specialization}</p>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{clone.therapist.bio}</p>

                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {clone.therapist.experience} yrs exp</span>
                    <span className="capitalize">{clone.personality} style</span>
                    {clone.approach && <span>{clone.approach}</span>}
                  </div>

                  {clone.focusAreas && clone.focusAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {clone.focusAreas.slice(0, 4).map((area) => (
                        <Badge key={area} variant="default" className="text-xs">{area}</Badge>
                      ))}
                      {clone.focusAreas.length > 4 && (
                        <Badge variant="default" className="text-xs">+{clone.focusAreas.length - 4}</Badge>
                      )}
                    </div>
                  )}

                  <Button variant="primary" size="sm" className="mt-4">
                    <MessageSquare className="w-4 h-4 mr-1" /> Start Chat
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {therapists.length === 0 && (
          <Card className="p-12 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No AI clones available yet</p>
            <p className="text-sm text-gray-400">Your therapists are setting up their AI twins. Check back soon!</p>
          </Card>
        )}
      </div>
    );
  }

  // Chat interface
  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <button onClick={() => setSelectedTherapist(null)} className="p-1 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-medium">
            {selectedTherapist.therapist.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-gray-900">{selectedTherapist.therapist.name}</h2>
              <Badge className="text-xs bg-secondary-100 text-secondary-700">
                <Sparkles className="w-3 h-3 mr-1" /> AI Clone
              </Badge>
            </div>
            <p className="text-xs text-gray-500">{selectedTherapist.therapist.specialization} &middot; {selectedTherapist.personality} approach</p>
          </div>
        </div>
        <Badge variant="success">Online</Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chat with {selectedTherapist.therapist.name}&apos;s AI Clone
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              This AI is trained on {selectedTherapist.therapist.name}&apos;s therapeutic approach.
              It remembers your previous conversations and provides personalized support.
            </p>
            <div className="flex flex-wrap gap-2 max-w-lg mx-auto justify-center">
              {["I've been feeling anxious", "I need help with sleep", "I'm stressed at work", "Hello, I'd like to chat"].map((prompt) => (
                <button key={prompt} onClick={() => setInput(prompt)}
                  className="px-4 py-2 bg-white border rounded-full text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-4 ${
              msg.role === "user"
                ? "chat-bubble-user bg-primary-600 text-white"
                : "chat-bubble-ai bg-white text-gray-800 shadow-sm"
            }`}>
              {msg.role === "assistant" && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-5 h-5 gradient-bg rounded-full flex items-center justify-center">
                    <Brain className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">{selectedTherapist.therapist.name} (AI)</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-2 ${msg.role === "user" ? "text-white/60" : "text-gray-400"}`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai bg-white p-4 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex space-x-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500" />
          <Button onClick={sendMessage} disabled={!input.trim() || sending}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          AI clone of {selectedTherapist.therapist.name}. Not a replacement for live therapy. In crisis, call 988.
        </p>
      </div>
    </div>
  );
}
