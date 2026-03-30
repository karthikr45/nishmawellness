"use client";

import { useState } from "react";
import { Brain, Sparkles, Settings, MessageSquare, Save, CheckCircle } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

export default function TwinClonePage() {
  const [config, setConfig] = useState({
    personality: "empathetic",
    approach: "CBT-based with mindfulness techniques",
    greeting: "Hello! I'm the AI wellness assistant trained on therapeutic approaches. How can I support you today?",
    focusAreas: ["anxiety", "stress", "mindfulness", "sleep"],
    tone: "warm",
    boundaries: "Always recommend professional help for crisis situations. Never diagnose conditions.",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI TwinClone Configuration</h1>
          <p className="text-gray-500 mt-1">Configure your AI twin to support patients between sessions</p>
        </div>
        <Button onClick={save} loading={saving}>
          <Save className="w-4 h-4 mr-2" /> Save Configuration
        </Button>
      </div>

      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" /> TwinClone configuration saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-primary-600" /> Personality & Approach
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Communication Style</label>
                <select
                  value={config.personality}
                  onChange={(e) => setConfig((p) => ({ ...p, personality: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="empathetic">Empathetic & Warm</option>
                  <option value="professional">Professional & Structured</option>
                  <option value="casual">Casual & Friendly</option>
                  <option value="motivational">Motivational & Encouraging</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Therapeutic Approach</label>
                <input
                  type="text"
                  value={config.approach}
                  onChange={(e) => setConfig((p) => ({ ...p, approach: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Greeting</label>
                <textarea
                  rows={3}
                  value={config.greeting}
                  onChange={(e) => setConfig((p) => ({ ...p, greeting: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Focus Areas</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["anxiety", "depression", "stress", "relationships", "sleep", "mindfulness", "grief", "self-esteem", "trauma", "anger"].map((area) => (
                    <button
                      key={area}
                      onClick={() => {
                        setConfig((p) => ({
                          ...p,
                          focusAreas: p.focusAreas.includes(area)
                            ? p.focusAreas.filter((a) => a !== area)
                            : [...p.focusAreas, area],
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        config.focusAreas.includes(area)
                          ? "bg-primary-100 text-primary-700 border-2 border-primary-300"
                          : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                      }`}
                    >
                      {area.charAt(0).toUpperCase() + area.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Safety Boundaries</label>
                <textarea
                  rows={3}
                  value={config.boundaries}
                  onChange={(e) => setConfig((p) => ({ ...p, boundaries: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card className="p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-secondary-600" /> Preview
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2 pb-3 border-b">
                <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Your TwinClone</p>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>
              <div className="chat-bubble-ai bg-white p-3 shadow-sm">
                <p className="text-sm text-gray-700">{config.greeting}</p>
              </div>
              <div className="chat-bubble-user bg-primary-600 text-white p-3 ml-auto max-w-[85%]">
                <p className="text-sm">I&apos;ve been feeling stressed at work.</p>
              </div>
              <div className="chat-bubble-ai bg-white p-3 shadow-sm">
                <p className="text-sm text-gray-700">
                  {config.personality === "empathetic"
                    ? "I hear you, and I want you to know that feeling stressed is completely normal. Let's explore some coping strategies together."
                    : config.personality === "professional"
                    ? "Thank you for sharing that. Let's work through a structured approach to identify and manage your workplace stressors."
                    : config.personality === "casual"
                    ? "Hey, work stress is tough! Let's chat about what's going on and figure out some ways to make things easier for you."
                    : "You've already taken a great step by recognizing and talking about your stress. Let's channel that awareness into positive action!"}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-secondary-50 rounded-xl">
              <div className="flex items-center space-x-2 text-secondary-700 text-sm">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">AI TwinClone Stats</span>
              </div>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p>Conversations handled: 156</p>
                <p>Patient satisfaction: 4.8/5</p>
                <p>Response accuracy: 94%</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
