"use client";

import Link from "next/link";
import {
  Briefcase, Brain, Wind, Clock, Heart,
  CheckCircle, ArrowRight, Shield, Sparkles, Target,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

const INTERVIEW_TIPS = [
  { phase: "1 Week Before", tips: [
    { title: "Research the company", desc: "Know their mission, recent news, and the role requirements.", icon: <Target className="w-5 h-5" /> },
    { title: "Practice with AI", desc: "Chat with our AI about your interview anxiety — it remembers and helps.", icon: <Brain className="w-5 h-5" />, link: "/patient/ai-chat" },
    { title: "Start daily meditation", desc: "10 minutes/day reduces anxiety by 40%. Start building the habit now.", icon: <Heart className="w-5 h-5" />, link: "/patient/exercises" },
  ]},
  { phase: "Night Before", tips: [
    { title: "Sleep stories", desc: "Use our sleep stories to calm your mind and get quality rest.", icon: <Shield className="w-5 h-5" />, link: "/patient/sleep" },
    { title: "Prepare your outfit", desc: "Remove decision fatigue — lay everything out the night before.", icon: <CheckCircle className="w-5 h-5" /> },
    { title: "Positive journaling", desc: "Write 3 reasons you're qualified. Read them in the morning.", icon: <Sparkles className="w-5 h-5" />, link: "/patient/journal" },
  ]},
  { phase: "30 Minutes Before", tips: [
    { title: "4-7-8 Breathing", desc: "4 cycles of this technique will calm your nervous system in 2 minutes.", icon: <Wind className="w-5 h-5" />, link: "/patient/exercises" },
    { title: "Power pose", desc: "Stand tall, hands on hips for 2 minutes. Research shows it boosts confidence.", icon: <Briefcase className="w-5 h-5" /> },
    { title: "Grounding exercise", desc: "5-4-3-2-1 technique: name 5 things you see, 4 you touch...", icon: <Brain className="w-5 h-5" />, link: "/patient/exercises" },
  ]},
  { phase: "During Interview", tips: [
    { title: "Pause before answering", desc: "Take a breath. It shows confidence, not hesitation. 'That's a great question, let me think...'", icon: <Clock className="w-5 h-5" /> },
    { title: "STAR method", desc: "Situation → Task → Action → Result. Structure every behavioral answer this way.", icon: <Target className="w-5 h-5" /> },
    { title: "It's a conversation", desc: "You're also evaluating them. Ask genuine questions. This reduces the power imbalance.", icon: <Heart className="w-5 h-5" /> },
  ]},
];

const COMMON_FEARS = [
  { fear: "I'll blank out and forget everything", reality: "Your preparation is in your subconscious. The pause technique gives your brain time to retrieve it." },
  { fear: "They'll ask something I don't know", reality: "Saying 'I don't know that yet, but here's how I'd learn it' shows growth mindset — interviewers love that." },
  { fear: "I'm not good enough compared to others", reality: "They called YOU for an interview. They already think you might be the right person." },
  { fear: "My anxiety will be visible", reality: "Most anxiety is invisible to others. And some nervousness shows you care — which is positive." },
];

export default function InterviewPrepPage() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Interview Prep Wellness</h1>
        <p className="text-gray-500 mt-3">
          Manage interview anxiety with proven techniques. Your mental state matters as much as your technical prep.
        </p>
      </div>

      {/* Timeline */}
      {INTERVIEW_TIPS.map((phase) => (
        <div key={phase.phase}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-2 h-2 rounded-full gradient-bg" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{phase.phase}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-5 border-l-2 border-gray-200 dark:border-gray-800 pl-6">
            {phase.tips.map((tip) => (
              <Card key={tip.title} hover className="p-5">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950 rounded-xl flex items-center justify-center text-primary-600 mb-3">
                  {tip.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{tip.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{tip.desc}</p>
                {tip.link && (
                  <Link href={tip.link} className="text-xs text-primary-600 hover:underline mt-2 inline-flex items-center">
                    Practice now <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Common Fears */}
      <Card className="p-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <Shield className="w-6 h-6 mr-2 text-primary-600" /> Reframing Common Fears
        </h2>
        <div className="space-y-4">
          {COMMON_FEARS.map((item) => (
            <div key={item.fear} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
                <p className="text-xs font-bold text-red-400 uppercase mb-1">Fear</p>
                <p className="text-sm text-red-800 dark:text-red-300 italic">&ldquo;{item.fear}&rdquo;</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl">
                <p className="text-xs font-bold text-green-400 uppercase mb-1">Reality</p>
                <p className="text-sm text-green-800 dark:text-green-300">{item.reality}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/patient/exercises">
          <Card hover className="p-6 text-center cursor-pointer">
            <Wind className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Quick Calm</h3>
            <p className="text-sm text-gray-500 mt-1">Breathing exercises for instant relief</p>
          </Card>
        </Link>
        <Link href="/patient/ai-chat">
          <Card hover className="p-6 text-center cursor-pointer">
            <Brain className="w-8 h-8 text-primary-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Talk to AI</h3>
            <p className="text-sm text-gray-500 mt-1">Practice answering tough questions</p>
          </Card>
        </Link>
        <Link href="/patient/career">
          <Card hover className="p-6 text-center cursor-pointer">
            <Target className="w-8 h-8 text-accent-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Career Assessment</h3>
            <p className="text-sm text-gray-500 mt-1">Find careers that match you</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
