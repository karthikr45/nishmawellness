"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Brain, Sparkles, Settings, MessageSquare, Save, CheckCircle,
  Plus, Trash2, BookOpen, Zap, Mic, Eye, BarChart3,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import Tooltip from "@/components/ui/tooltip";

interface SampleResponse {
  question: string;
  answer: string;
}

interface KnowledgeEntry {
  topic: string;
  content: string;
}

export default function TwinClonePage() {
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState("personality");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showQAModal, setShowQAModal] = useState(false);
  const [showKBModal, setShowKBModal] = useState(false);
  const [newQA, setNewQA] = useState({ question: "", answer: "" });
  const [newKB, setNewKB] = useState({ topic: "", content: "" });

  const [config, setConfig] = useState({
    isActive: true,
    personality: "empathetic",
    approach: "CBT-based with mindfulness techniques",
    tone: "warm",
    greeting: "Hello! I'm the AI wellness assistant trained on your therapist's approach. How can I support you today?",
    focusAreas: ["anxiety", "stress", "mindfulness", "sleep"] as string[],
    boundaries: "Always recommend professional help for crisis situations. Never diagnose conditions. Refer to 988 hotline for suicidal thoughts.",
    sampleResponses: [] as SampleResponse[],
    knowledgeBase: [] as KnowledgeEntry[],
    techniques: [] as string[],
    phrases: [] as string[],
    voiceStyle: "calm",
    avatarStyle: "default",
  });

  const [newTechnique, setNewTechnique] = useState("");
  const [newPhrase, setNewPhrase] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/twinclone")
        .then((r) => r.json())
        .then((data) => {
          if (data.personality) {
            setConfig({
              isActive: data.isActive ?? true,
              personality: data.personality || "empathetic",
              approach: data.approach || "",
              tone: data.tone || "warm",
              greeting: data.greeting || "",
              focusAreas: data.focusAreas || [],
              boundaries: data.boundaries || "",
              sampleResponses: data.sampleResponses || [],
              knowledgeBase: data.knowledgeBase || [],
              techniques: data.techniques || [],
              phrases: data.phrases || [],
              voiceStyle: data.voiceStyle || "calm",
              avatarStyle: data.avatarStyle || "default",
            });
          }
        })
        .catch(console.error);
    }
  }, [status]);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/twinclone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const addQA = () => {
    if (!newQA.question || !newQA.answer) return;
    setConfig((p) => ({ ...p, sampleResponses: [...p.sampleResponses, newQA] }));
    setNewQA({ question: "", answer: "" });
    setShowQAModal(false);
  };

  const addKB = () => {
    if (!newKB.topic || !newKB.content) return;
    setConfig((p) => ({ ...p, knowledgeBase: [...p.knowledgeBase, newKB] }));
    setNewKB({ topic: "", content: "" });
    setShowKBModal(false);
  };

  const tabs = [
    { id: "personality", label: "Personality", icon: <Settings className="w-4 h-4" /> },
    { id: "training", label: "Training Data", icon: <Brain className="w-4 h-4" /> },
    { id: "knowledge", label: "Knowledge Base", icon: <BookOpen className="w-4 h-4" /> },
    { id: "voice", label: "Voice & Avatar", icon: <Mic className="w-4 h-4" /> },
    { id: "preview", label: "Preview", icon: <Eye className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            AI TwinClone Studio
            <Tooltip
              maxWidth={320}
              content="TwinClone is your personalised AI assistant — trained on your therapeutic approach, tone, and signature techniques. It supports your patients between sessions, while you remain in full control: review every conversation, refine its responses, and disable it any time."
            />
          </h1>
          <p className="text-gray-500 mt-1">Train and configure your digital twin therapist</p>
        </div>
        <div className="flex items-center space-x-3">
          {saved && <span className="text-green-600 text-sm flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Saved</span>}
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={config.isActive}
              onChange={(e) => setConfig((p) => ({ ...p, isActive: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded" />
            <span className="text-sm text-gray-600">{config.isActive ? "Active" : "Inactive"}</span>
          </label>
          <Button onClick={save} loading={saving}>
            <Save className="w-4 h-4 mr-2" /> Save All Changes
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Sample Responses", value: config.sampleResponses.length, color: "bg-blue-100 text-blue-600" },
          { label: "Knowledge Entries", value: config.knowledgeBase.length, color: "bg-green-100 text-green-600" },
          { label: "Techniques", value: config.techniques.length, color: "bg-purple-100 text-purple-600" },
          { label: "Signature Phrases", value: config.phrases.length, color: "bg-orange-100 text-orange-600" },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-white text-primary-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            {tab.icon}<span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Personality Tab */}
      {activeTab === "personality" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Communication Style</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Personality Type</label>
              <select value={config.personality} onChange={(e) => setConfig((p) => ({ ...p, personality: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                <option value="empathetic">Empathetic & Warm</option>
                <option value="professional">Professional & Structured</option>
                <option value="casual">Casual & Friendly</option>
                <option value="motivational">Motivational & Encouraging</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Therapeutic Approach</label>
              <input type="text" value={config.approach} onChange={(e) => setConfig((p) => ({ ...p, approach: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., CBT with mindfulness integration" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Greeting</label>
              <textarea rows={3} value={config.greeting} onChange={(e) => setConfig((p) => ({ ...p, greeting: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="How your AI clone greets patients..." />
              <p className="text-xs text-gray-400 mt-1">Use {"{name}"} to insert the patient&apos;s name</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Safety Boundaries</label>
              <textarea rows={3} value={config.boundaries} onChange={(e) => setConfig((p) => ({ ...p, boundaries: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Focus Areas</h2>
            <p className="text-sm text-gray-500">Select topics your AI clone should focus on:</p>
            <div className="flex flex-wrap gap-2">
              {["anxiety", "depression", "stress", "relationships", "sleep", "mindfulness", "grief", "self-esteem", "trauma", "anger", "burnout", "family", "career", "addiction", "eating"].map((area) => (
                <button key={area}
                  onClick={() => setConfig((p) => ({
                    ...p,
                    focusAreas: p.focusAreas.includes(area)
                      ? p.focusAreas.filter((a) => a !== area)
                      : [...p.focusAreas, area],
                  }))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    config.focusAreas.includes(area)
                      ? "bg-primary-100 text-primary-700 border-2 border-primary-300"
                      : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                  }`}>
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </button>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mt-6">Therapeutic Techniques</h3>
            <div className="space-y-2">
              {config.techniques.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{t}</span>
                  <button onClick={() => setConfig((p) => ({ ...p, techniques: p.techniques.filter((_, idx) => idx !== i) }))}
                    className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input type="text" value={newTechnique} onChange={(e) => setNewTechnique(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newTechnique.trim()) { setConfig((p) => ({ ...p, techniques: [...p.techniques, newTechnique.trim()] })); setNewTechnique(""); } }}
                  placeholder="e.g., Progressive muscle relaxation" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                <Button size="sm" variant="outline" onClick={() => { if (newTechnique.trim()) { setConfig((p) => ({ ...p, techniques: [...p.techniques, newTechnique.trim()] })); setNewTechnique(""); } }}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mt-4">Signature Phrases</h3>
            <p className="text-xs text-gray-400">Phrases your AI clone will naturally use in conversations:</p>
            <div className="space-y-2">
              {config.phrases.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-secondary-50 rounded-lg">
                  <span className="text-sm text-gray-700 italic">&ldquo;{p}&rdquo;</span>
                  <button onClick={() => setConfig((prev) => ({ ...prev, phrases: prev.phrases.filter((_, idx) => idx !== i) }))}
                    className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input type="text" value={newPhrase} onChange={(e) => setNewPhrase(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newPhrase.trim()) { setConfig((p) => ({ ...p, phrases: [...p.phrases, newPhrase.trim()] })); setNewPhrase(""); } }}
                  placeholder='e.g., "Remember, small steps lead to big changes"' className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                <Button size="sm" variant="outline" onClick={() => { if (newPhrase.trim()) { setConfig((p) => ({ ...p, phrases: [...p.phrases, newPhrase.trim()] })); setNewPhrase(""); } }}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Training Data Tab */}
      {activeTab === "training" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sample Q&A Training</h2>
              <p className="text-sm text-gray-500">Teach your AI clone how to respond to specific questions</p>
            </div>
            <Button onClick={() => setShowQAModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Q&A Pair
            </Button>
          </div>

          {config.sampleResponses.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">No training data yet</p>
              <p className="text-sm text-gray-400 mb-4">Add question-answer pairs to teach your clone your approach</p>
              <Button variant="outline" onClick={() => setShowQAModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add First Q&A
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {config.sampleResponses.map((qa, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        <Badge variant="info" className="mr-2">Q</Badge>{qa.question}
                      </p>
                      <p className="text-sm text-gray-600 ml-8">
                        <Badge variant="success" className="mr-2">A</Badge>{qa.answer}
                      </p>
                    </div>
                    <button onClick={() => setConfig((p) => ({ ...p, sampleResponses: p.sampleResponses.filter((_, idx) => idx !== i) }))}
                      className="text-red-400 hover:text-red-600 ml-3"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick-add suggested Q&As */}
          <div className="mt-6 p-4 bg-primary-50 rounded-xl">
            <p className="text-sm font-medium text-primary-800 mb-3">Suggested Training Prompts:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "How do I handle a panic attack?",
                "I can't stop negative thinking",
                "I'm having trouble sleeping",
                "How do I set boundaries?",
                "I feel overwhelmed at work",
              ].map((q) => (
                <button key={q} onClick={() => { setNewQA({ question: q, answer: "" }); setShowQAModal(true); }}
                  className="px-3 py-1.5 bg-white border border-primary-200 rounded-full text-xs text-primary-700 hover:bg-primary-100">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Knowledge Base Tab */}
      {activeTab === "knowledge" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Knowledge Base</h2>
              <p className="text-sm text-gray-500">Add articles, techniques, and resources your AI clone can reference</p>
            </div>
            <Button onClick={() => setShowKBModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Entry
            </Button>
          </div>

          {config.knowledgeBase.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No knowledge base entries yet</p>
              <Button variant="outline" onClick={() => setShowKBModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add First Entry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.knowledgeBase.map((kb, i) => (
                <div key={i} className="p-4 border rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{kb.topic}</h3>
                    <button onClick={() => setConfig((p) => ({ ...p, knowledgeBase: p.knowledgeBase.filter((_, idx) => idx !== i) }))}
                      className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-3">{kb.content}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Voice & Avatar Tab */}
      {activeTab === "voice" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Mic className="w-5 h-5 mr-2" /> Voice Settings
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voice Style</label>
              <select value={config.voiceStyle} onChange={(e) => setConfig((p) => ({ ...p, voiceStyle: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                <option value="calm">Calm & Soothing</option>
                <option value="warm">Warm & Friendly</option>
                <option value="professional">Professional & Clear</option>
                <option value="energetic">Energetic & Motivating</option>
              </select>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700">
                <Sparkles className="w-4 h-4 inline mr-1" />
                Voice synthesis uses browser TTS by default. Connect ElevenLabs API key in settings for ultra-realistic voice.
              </p>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" /> Avatar Appearance
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Style</label>
              <select value={config.avatarStyle} onChange={(e) => setConfig((p) => ({ ...p, avatarStyle: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                <option value="default">Default (Animated SVG)</option>
                <option value="professional">Professional Look</option>
                <option value="friendly">Friendly & Approachable</option>
                <option value="minimal">Minimal / Abstract</option>
              </select>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-700">
                <Zap className="w-4 h-4 inline mr-1" />
                Connect D-ID or HeyGen API for a photorealistic video avatar that matches your appearance.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === "preview" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2" /> Live Preview
          </h2>
          <div className="max-w-md mx-auto bg-gray-50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 pb-4 border-b">
              <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Your TwinClone</p>
                <p className="text-xs text-green-500">Online &middot; {config.personality}</p>
              </div>
            </div>
            <div className="chat-bubble-ai bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-700">{config.greeting || "Hello! How can I support you today?"}</p>
            </div>
            <div className="chat-bubble-user bg-primary-600 text-white p-3 ml-auto max-w-[85%]">
              <p className="text-sm">I&apos;ve been feeling really stressed at work lately.</p>
            </div>
            <div className="chat-bubble-ai bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-700">
                {config.personality === "empathetic"
                  ? "I hear you, and I want you to know that feeling stressed is completely valid. Let's explore what's happening and find ways to manage it together."
                  : config.personality === "professional"
                  ? "Thank you for sharing. Let's systematically identify your workplace stressors and develop a structured coping plan."
                  : config.personality === "casual"
                  ? "Hey, work stress is tough! Let's chat about what's going on and figure out some ways to make things easier."
                  : "You're already taking a great step by talking about it! Let's channel that awareness into positive action."}
                {config.techniques.length > 0 && ` I often recommend: ${config.techniques[0]}.`}
                {config.phrases.length > 0 && ` ${config.phrases[0]}`}
              </p>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-xs text-gray-400">This preview shows how your TwinClone will respond based on your current settings</p>
          </div>
        </Card>
      )}

      {/* Q&A Modal */}
      <Modal isOpen={showQAModal} onClose={() => setShowQAModal(false)} title="Add Training Q&A" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Question</label>
            <input type="text" value={newQA.question} onChange={(e) => setNewQA((p) => ({ ...p, question: e.target.value }))}
              placeholder='e.g., "How do I handle a panic attack?"'
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Recommended Response</label>
            <textarea rows={5} value={newQA.answer} onChange={(e) => setNewQA((p) => ({ ...p, answer: e.target.value }))}
              placeholder="Write the response as you would say it in a session. Use {name} for patient's name."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
          </div>
          <Button onClick={addQA} className="w-full" disabled={!newQA.question || !newQA.answer}>Add Training Pair</Button>
        </div>
      </Modal>

      {/* Knowledge Base Modal */}
      <Modal isOpen={showKBModal} onClose={() => setShowKBModal(false)} title="Add Knowledge Entry" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <input type="text" value={newKB.topic} onChange={(e) => setNewKB((p) => ({ ...p, topic: e.target.value }))}
              placeholder='e.g., "Cognitive Behavioral Therapy Basics"'
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea rows={8} value={newKB.content} onChange={(e) => setNewKB((p) => ({ ...p, content: e.target.value }))}
              placeholder="Enter detailed information about this topic that your AI clone can reference..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
          </div>
          <Button onClick={addKB} className="w-full" disabled={!newKB.topic || !newKB.content}>Add Entry</Button>
        </div>
      </Modal>
    </div>
  );
}
