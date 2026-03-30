"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import { Brain, Send, ArrowRight, Shield, Sparkles, Clock } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export default function PublicAIChat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    if (!session) {
      // Allow limited demo without login
      setStarted(true);
      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: input, createdAt: new Date().toISOString() };
      setMessages((prev) => [...prev, userMsg]);
      const text = input;
      setInput("");
      setSending(true);

      // Simple demo response
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "Thank you for sharing. I'm here to support you. To continue with personalized AI therapy sessions, please sign up for a free account. You'll get access to our full AI TwinClone feature, which provides 24/7 support tailored to your needs.",
          createdAt: new Date().toISOString(),
        }]);
        setSending(false);
      }, 1500);
      return;
    }

    setStarted(true);
    setSending(true);
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: input, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    const text = input;
    setInput("");

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  if (!started) {
    return (
      <main>
        <Navbar />
        <div className="pt-24 min-h-screen bg-gradient-to-b from-secondary-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Wellness Chat</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
              Talk to our AI TwinClone therapist for immediate wellness support.
              Available 24/7, completely confidential.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: <Sparkles className="w-6 h-6" />, title: "AI-Powered", desc: "Trained on therapeutic approaches" },
                { icon: <Clock className="w-6 h-6" />, title: "Available 24/7", desc: "Support whenever you need it" },
                { icon: <Shield className="w-6 h-6" />, title: "Confidential", desc: "Private and secure conversations" },
              ].map((f) => (
                <Card key={f.title} className="p-6 text-center">
                  <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center text-secondary-600 mx-auto mb-3">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
                </Card>
              ))}
            </div>

            <div className="max-w-lg mx-auto">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="How are you feeling today?"
                  className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 text-lg shadow-sm"
                />
                <Button onClick={sendMessage} size="lg" className="rounded-2xl">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {["I'm feeling anxious", "Help me relax", "I need sleep tips", "Stress at work"].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="px-4 py-2 bg-white border rounded-full text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="pt-16 h-screen flex flex-col">
        <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">AI TwinClone Therapist</h2>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </div>
            {!session && (
              <Link href="/register">
                <Button size="sm" variant="primary">
                  Sign Up for Full Access <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-4 ${
                  msg.role === "user"
                    ? "chat-bubble-user bg-primary-600 text-white"
                    : "chat-bubble-ai bg-white text-gray-800 shadow-sm"
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
              <Button onClick={sendMessage} disabled={!input.trim() || sending}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              For emergencies, call 988 (Suicide & Crisis Lifeline) or 911.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
