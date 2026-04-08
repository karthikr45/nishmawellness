"use client";

import { Lightbulb, Users, Heart, Brain, Shield, MessageSquare, CheckCircle } from "lucide-react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";

const TIPS = [
  { category: "Daily Practices", items: [
    { title: "Start meetings with a check-in", desc: "Ask 'How is everyone doing?' before jumping into agenda. This normalizes talking about well-being.", icon: <MessageSquare className="w-5 h-5" /> },
    { title: "Recognize effort, not just results", desc: "Appreciate team members who show up consistently, especially during tough periods.", icon: <Heart className="w-5 h-5" /> },
    { title: "Model healthy boundaries", desc: "Don't send emails after hours. Take your lunch break. Your team mirrors your behavior.", icon: <Shield className="w-5 h-5" /> },
  ]},
  { category: "When You Notice Stress", items: [
    { title: "Have a private conversation", desc: "Say: 'I've noticed you seem a bit off lately. Is everything okay? No pressure to share, just want you to know I'm here.'", icon: <Users className="w-5 h-5" /> },
    { title: "Reduce workload temporarily", desc: "Redistribute tasks for a week or two. Burnout recovery requires reduced load, not just 'taking a break.'", icon: <CheckCircle className="w-5 h-5" /> },
    { title: "Point to resources", desc: "Remind them about Nishma: AI chat, exercises, therapy sessions — all confidential and covered.", icon: <Brain className="w-5 h-5" /> },
  ]},
  { category: "Preventive Strategies", items: [
    { title: "No-meeting days", desc: "Implement one day per week with no meetings. Deep work time reduces stress significantly.", icon: <Shield className="w-5 h-5" /> },
    { title: "Team wellness challenges", desc: "Start a team meditation challenge or step challenge. Competition builds camaraderie.", icon: <Heart className="w-5 h-5" /> },
    { title: "Regular 1:1 check-ins", desc: "15 minutes weekly — not about tasks, but about how they're doing. This alone reduces burnout by 40%.", icon: <MessageSquare className="w-5 h-5" /> },
  ]},
  { category: "Red Flags to Watch", items: [
    { title: "Sudden withdrawal", desc: "Employee who was social suddenly becomes quiet, skips team events, or eats alone.", icon: <Users className="w-5 h-5" /> },
    { title: "Performance drop without clear cause", desc: "Missing deadlines, careless errors, or forgetting meetings — could be mental health, not laziness.", icon: <CheckCircle className="w-5 h-5" /> },
    { title: "Increased sick leave", desc: "Frequent absences, especially Mondays/Fridays, may indicate burnout or depression.", icon: <Shield className="w-5 h-5" /> },
  ]},
];

const DOS_AND_DONTS = [
  { do: "Say: 'I've noticed... I care about you'", dont: "Say: 'You need to get it together'" },
  { do: "Offer flexibility when possible", dont: "Demand they explain personal struggles" },
  { do: "Share wellness resources privately", dont: "Discuss someone's mental health publicly" },
  { do: "Follow up after difficult conversations", dont: "Assume one chat fixes everything" },
  { do: "Normalize therapy and self-care", dont: "Treat wellness as weakness" },
];

export default function ManagerToolkitPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manager Wellness Toolkit</h1>
        <p className="text-gray-500 mt-1">Evidence-based guide for supporting your team&apos;s mental health</p>
      </div>

      <div className="p-4 bg-primary-50 dark:bg-primary-950 rounded-xl">
        <p className="text-sm text-primary-700 dark:text-primary-300">
          <Lightbulb className="w-4 h-4 inline mr-1" />
          <strong>Managers are the #1 factor</strong> in employee mental health — more than workload, pay, or benefits.
          Your awareness and actions directly impact your team&apos;s well-being.
        </p>
      </div>

      {TIPS.map((section) => (
        <Card key={section.category} className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{section.category}</h2>
          <div className="space-y-4">
            {section.items.map((tip) => (
              <div key={tip.title} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
                  {tip.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{tip.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Do&apos;s and Don&apos;ts</h2>
        <div className="space-y-3">
          {DOS_AND_DONTS.map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-xl flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-800 dark:text-green-300">{item.do}</span>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-xl flex items-start space-x-2">
                <span className="text-red-600 font-bold text-sm mt-0.5 flex-shrink-0">&times;</span>
                <span className="text-sm text-red-800 dark:text-red-300">{item.dont}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
