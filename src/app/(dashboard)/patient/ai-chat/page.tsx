"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Brain, Send, Plus, MessageSquare } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface ChatSession {
  sessionId: string;
  createdAt: string;
  content: string;
}

export default function PatientAIChat() {
  const { status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/ai-chat")
        .then((r) => r.json())
        .then(setSessions)
        .catch(console.error);
    }
  }, [status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    const res = await fetch(`/api/ai-chat?sessionId=${sessionId}`);
    const data = await res.json();
    setMessages(data);
  };

  const startNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);

    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const messageText = input;
    setInput("");

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, sessionId: currentSessionId }),
      });
      const data = await res.json();

      if (!currentSessionId) {
        setCurrentSessionId(data.sessionId);
        setSessions((prev) => [
          { sessionId: data.sessionId, createdAt: new Date().toISOString(), content: messageText },
          ...prev,
        ]);
      }

      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* Sidebar - Chat History */}
      <div className="hidden md:block w-72 flex-shrink-0">
        <Card className="h-full flex flex-col">
          <div className="p-4 border-b">
            <Button onClick={startNewSession} className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" /> New Chat
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sessions.map((s) => (
              <button
                key={s.sessionId}
                onClick={() => loadSession(s.sessionId)}
                className={`w-full text-left p-3 rounded-xl text-sm transition-colors ${
                  currentSessionId === s.sessionId ? "bg-primary-50 text-primary-700" : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{s.content.substring(0, 40)}...</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center space-x-3">
          <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">AI TwinClone Therapist</h2>
            <p className="text-xs text-green-500">Always available for you</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Wellness Assistant</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                I&apos;m your AI wellness companion, modeled after expert therapeutic approaches.
                Share what&apos;s on your mind - I&apos;m here to help.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  "I've been feeling anxious lately",
                  "Help me with a meditation exercise",
                  "I'm having trouble sleeping",
                  "I need stress management tips",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { setInput(prompt); }}
                    className="text-left p-3 bg-gray-50 rounded-xl text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                  >
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
                  : "chat-bubble-ai bg-gray-100 text-gray-800"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-2 ${msg.role === "user" ? "text-white/60" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="chat-bubble-ai bg-gray-100 p-4">
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
        <div className="p-4 border-t">
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <Button onClick={sendMessage} disabled={!input.trim() || sending}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI responses are for support purposes. For emergencies, please call 988 (Suicide & Crisis Lifeline).
          </p>
        </div>
      </Card>
    </div>
  );
}
