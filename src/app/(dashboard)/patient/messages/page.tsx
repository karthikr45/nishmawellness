"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Send } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

interface Contact {
  user: { id: string; name: string; role: string };
  lastMessage: { content: string; createdAt: string };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
}

export default function PatientMessages() {
  const { data: session, status } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/messages")
        .then((r) => r.json())
        .then(setContacts)
        .catch(console.error);
    }
  }, [status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async (userId: string) => {
    setSelectedContact(userId);
    const res = await fetch(`/api/messages?userId=${userId}`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedContact) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: selectedContact, content: input }),
    });
    const msg = await res.json();
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* Contacts */}
      <div className="w-80 flex-shrink-0">
        <Card className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Messages</h2>
            <p className="text-xs text-gray-500 mt-0.5">Direct messages with therapists you have booked.</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-semibold text-gray-700 mb-1">No conversations yet</p>
                <p className="text-xs text-gray-400 mb-3">Messages open once you have booked a session with a therapist. They are private 1:1 and support async check-ins between sessions.</p>
                <p className="mt-1">Book a session to start chatting with a therapist</p>
              </div>
            ) : (
              contacts.map((c) => (
                <button
                  key={c.user.id}
                  onClick={() => loadMessages(c.user.id)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                    selectedContact === c.user.id ? "bg-primary-50" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {c.user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 text-sm">{c.user.name}</p>
                        {c.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{c.lastMessage?.content}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Chat */}
      <Card className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">
                {contacts.find((c) => c.user.id === selectedContact)?.user.name}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender.id === session?.user?.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                    msg.sender.id === session?.user?.id
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.sender.id === session?.user?.id ? "text-white/60" : "text-gray-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
              <Button onClick={sendMessage} disabled={!input.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose a contact to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
