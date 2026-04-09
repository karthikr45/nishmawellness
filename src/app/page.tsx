"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  Brain, ArrowRight, Building2, Sparkles, Shield, GraduationCap,
  Heart, Star, CheckCircle, Clock, Users, Video, ChevronRight,
} from "lucide-react";
import Button from "@/components/ui/button";

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function HomePage() {
  const containerRef = useScrollReveal();

  return (
    <main ref={containerRef}>
      <Navbar />

      {/* HERO — Moon Dust theme */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#1a1832]">
        {/* Moon Dust gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1832] via-[#1e1d3a] to-[#141830]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#80A8FF]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#CEB5FF]/8 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#8EC1DE]/6 rounded-full blur-[120px]" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-primary-400 text-sm font-medium mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Trusted by 200+ organizations worldwide
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
                The wellness
                <br />
                platform that
                <br />
                <span className="bg-gradient-to-r from-[#80A8FF] via-[#CEB5FF] to-[#8EC1DE] bg-clip-text text-transparent">
                  never forgets.
                </span>
              </h1>

              <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-lg leading-relaxed">
                AI therapy that remembers every conversation. Burnout prediction that saves companies millions. Wellness that actually works.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 mt-10">
                <Link href="/register"
                  className="px-8 py-4 bg-gradient-to-r from-[#6690f5] to-[#8560d4] text-white font-bold text-base rounded-2xl hover:from-[#4d73e0] hover:to-[#6d48b8] transition-all shadow-2xl shadow-[#80A8FF]/25 flex items-center">
                  Start Free — No Card Required <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link href="/company-signup"
                  className="px-8 py-4 border border-white/20 text-white font-semibold text-base rounded-2xl hover:bg-white/5 transition-all flex items-center backdrop-blur-sm">
                  <Building2 className="w-5 h-5 mr-2 text-primary-400" /> For Companies
                </Link>
              </div>

              <div className="flex items-center gap-8 mt-12">
                {[
                  { value: "10K+", label: "Active Users" },
                  { value: "200+", label: "Companies" },
                  { value: "98%", label: "Satisfaction" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — App Preview */}
            <div className="animate-fade-in-up hidden lg:block" style={{ animationDelay: "0.3s" }}>
              <div className="relative">
                {/* Glow behind the card */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-3xl" />

                {/* Main preview card */}
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                  {/* Mini app header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-gray-500 font-mono">nishma wellness</span>
                  </div>

                  {/* Chat preview showing memory */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/10 rounded-2xl rounded-tl-md p-4 max-w-[85%]">
                        <p className="text-sm text-gray-200 leading-relaxed">
                          Welcome back, Priya. Last session you mentioned the deadline with your manager Rahul was stressing you out. You committed to trying the breathing exercise. How did it go?
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="bg-primary-600 rounded-2xl rounded-tr-md p-4 max-w-[75%]">
                        <p className="text-sm text-white leading-relaxed">
                          It actually helped! I did the 4-7-8 breathing before the meeting and felt much calmer.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/10 rounded-2xl rounded-tl-md p-4 max-w-[85%]">
                        <p className="text-sm text-gray-200 leading-relaxed">
                          That&apos;s wonderful progress! I&apos;ve noticed anxiety has come up in 5 of our conversations. But your coping is getting stronger each time. 💪
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom stats bar */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary-400">47</p>
                        <p className="text-[10px] text-gray-500">Sessions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-400">↑ 23%</p>
                        <p className="text-[10px] text-gray-500">Mood</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-accent-400">12</p>
                        <p className="text-[10px] text-gray-500">Day Streak</p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      Mood: Improving
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* SECTION: Session 47 Comparison — THE KEY USP */}
      <section className="py-32 bg-gradient-to-b from-[#f8f7ff] to-white dark:from-gray-950 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#D3D3FF]/20 rounded-full blur-[120px]" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Every session feels <span className="gradient-text">personal.</span>
            </h2>
            <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
              Our AI remembers your story, your struggles, your progress — and picks up exactly where you left off.
            </p>
          </div>

          <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Other apps */}
            <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 rounded-3xl p-8">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-6">Every Other App — Session 47</p>
              <div className="space-y-4">
                <div className="chat-bubble-ai bg-white dark:bg-gray-800 p-4 shadow-sm max-w-[85%]">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Hi! How can I help you today?</p>
                </div>
                <div className="chat-bubble-user bg-gray-200 dark:bg-gray-700 p-4 max-w-[85%] ml-auto">
                  <p className="text-sm text-gray-700 dark:text-gray-300">I told you last week about my boss. The meeting happened.</p>
                </div>
                <div className="chat-bubble-ai bg-white dark:bg-gray-800 p-4 shadow-sm max-w-[85%]">
                  <p className="text-sm text-gray-600 dark:text-gray-300">I&apos;m sorry, I don&apos;t have context from previous conversations. Could you tell me more?</p>
                </div>
              </div>
              <p className="text-sm text-red-500 font-semibold mt-6">Starts over. Every. Single. Time.</p>
            </div>

            {/* Nishma */}
            <div className="bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200/50 dark:border-primary-800/30 rounded-3xl p-8">
              <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-6">Nishma — Session 47</p>
              <div className="space-y-4">
                <div className="chat-bubble-ai bg-white dark:bg-gray-800 p-4 shadow-sm max-w-[85%]">
                  <p className="text-sm text-gray-700 dark:text-gray-300">Last week, you said you were going to have that conversation with your manager Sarah. You&apos;d avoided it twice before. Did you have it?</p>
                </div>
                <div className="chat-bubble-user bg-primary-600 text-white p-4 max-w-[85%] ml-auto">
                  <p className="text-sm">It actually went better than I expected.</p>
                </div>
                <div className="chat-bubble-ai bg-white dark:bg-gray-800 p-4 shadow-sm max-w-[85%]">
                  <p className="text-sm text-gray-700 dark:text-gray-300">That matters. Two weeks ago you told me you were most scared of her reaction. What was it like in reality versus what you imagined?</p>
                </div>
              </div>
              <p className="text-sm text-primary-600 font-semibold mt-6">Sees the pattern. Tracks the progress. Helps you resolve.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: For Companies — Burnout Prediction */}
      <section className="py-32 bg-gradient-to-b from-white to-[#f0f4ff] dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-[#80A8FF]/10 rounded-full blur-[120px]" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="reveal grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1.5 bg-accent-100 dark:bg-accent-950 rounded-full text-accent-700 dark:text-accent-300 text-sm font-medium mb-6">
                <Building2 className="w-4 h-4 mr-2" /> For Companies
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                Predict burnout
                <br />
                <span className="gradient-text">before it happens.</span>
              </h2>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                Our AI analyzes mood patterns, engagement drops, and wellness signals to
                identify at-risk teams weeks before burnout hits — saving you $15-30K per employee.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Department wellness heatmap (red/yellow/green)",
                  "Automatic incident alerts for HR",
                  "Team leaderboards that drive engagement",
                  "100% anonymized — individual data never exposed",
                ].map((item) => (
                  <li key={item} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/company-signup" className="inline-block mt-8">
                <Button size="lg" className="rounded-2xl">
                  Set Up Your Company <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Heatmap visual */}
            <div className="reveal bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
              <p className="text-sm font-semibold text-gray-500 mb-6">Wellness Heatmap — Live</p>
              <div className="space-y-3">
                {[
                  { dept: "Engineering", mood: 78, status: "HEALTHY", color: "bg-green-500" },
                  { dept: "Sales", mood: 52, status: "MODERATE", color: "bg-yellow-500" },
                  { dept: "Customer Support", mood: 34, status: "CONCERNING", color: "bg-orange-500" },
                  { dept: "Compliance", mood: 22, status: "CRITICAL", color: "bg-red-500" },
                  { dept: "Marketing", mood: 71, status: "HEALTHY", color: "bg-green-500" },
                ].map((d) => (
                  <div key={d.dept} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${d.color}`} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{d.dept}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className={`${d.color} h-2 rounded-full`} style={{ width: `${d.mood}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{d.mood}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                  Alert: Compliance team showing critical burnout risk. 3 of 8 employees at risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: For Students */}
      <section className="py-32 bg-gradient-to-b from-[#f0f4ff] to-[#f8f5ff] dark:from-gray-950 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-[#CEB5FF]/15 rounded-full blur-[120px]" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="reveal grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Visual */}
            <div className="reveal bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-primary-950 rounded-3xl p-8 order-2 lg:order-1">
              <p className="text-sm font-semibold text-secondary-600 mb-4">Career Explorer Results</p>
              <div className="space-y-3">
                {[
                  { name: "Technology & Engineering", pct: 87, color: "bg-primary-500" },
                  { name: "Science & Research", pct: 72, color: "bg-secondary-500" },
                  { name: "Creative & Design", pct: 65, color: "bg-accent-500" },
                  { name: "Business & Finance", pct: 48, color: "bg-blue-500" },
                ].map((r) => (
                  <div key={r.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{r.name}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{r.pct}%</span>
                    </div>
                    <div className="w-full bg-white/60 dark:bg-gray-800 rounded-full h-2.5">
                      <div className={`${r.color} h-2.5 rounded-full`} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <p className="text-xs text-gray-500 mb-2">Suggested Careers:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Software Engineer", "Data Scientist", "UX Designer", "Research Analyst"].map((c) => (
                    <span key={c} className="px-2.5 py-1 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center px-3 py-1.5 bg-secondary-100 dark:bg-secondary-950 rounded-full text-secondary-700 dark:text-secondary-300 text-sm font-medium mb-6">
                <GraduationCap className="w-4 h-4 mr-2" /> For Students
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                Confused about
                <br />
                <span className="gradient-text">your career?</span>
              </h2>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                Take our career interest assessment, get AI-powered guidance,
                manage exam stress, and prepare for interviews — all with mental
                health support built in.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Career interest assessment with 8 career clusters",
                  "AI chat that understands exam pressure & placement anxiety",
                  "Interview prep wellness — from 1 week before to the moment of",
                  "Student pricing from ₹149/month — or free with campus plan",
                ].map((item) => (
                  <li key={item} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-4 mt-8">
                <Link href="/student-signup">
                  <Button size="lg" className="rounded-2xl">
                    Student Signup <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/join-campus" className="text-sm text-primary-600 hover:underline font-medium">
                  My campus has Nishma →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Features Grid */}
      <section className="py-32 bg-gradient-to-b from-[#f8f5ff] to-white dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#8EC1DE]/10 rounded-full blur-[120px]" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Everything you need.
              <br />
              <span className="gradient-text">Nothing you don&apos;t.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Brain className="w-6 h-6" />, title: "AI TwinClone", desc: "Your therapist's digital twin. Available 24/7. Remembers everything.", color: "bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400" },
              { icon: <Video className="w-6 h-6" />, title: "Video Therapy", desc: "Face-to-face sessions with licensed therapists from anywhere.", color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
              { icon: <Heart className="w-6 h-6" />, title: "Guided Exercises", desc: "Breathing, meditation, body scan — with interactive timers.", color: "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400" },
              { icon: <Shield className="w-6 h-6" />, title: "HIPAA Compliant", desc: "End-to-end encryption. Your data stays yours.", color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" },
              { icon: <Users className="w-6 h-6" />, title: "Family & Groups", desc: "Family wellness plans. Group therapy sessions. Community forum.", color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
              { icon: <Clock className="w-6 h-6" />, title: "Progress Tracking", desc: "Weekly reports, mood charts, achievements. See your growth.", color: "bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-400" },
            ].map((feature) => (
              <div key={feature.title} className="reveal hover-lift bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8">
                <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Social Proof */}
      <section className="py-32 bg-gradient-to-b from-white to-[#f0f4ff] dark:from-gray-950 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-[#D3D3FF]/15 rounded-full blur-[120px]" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="reveal text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              What people <span className="gradient-text">say.</span>
            </h2>
          </div>

          <div className="reveal grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Sarah M.", role: "Patient", text: "The AI remembers my boss's name, my sleep problems, even the breathing exercise that helped. It's like talking to someone who actually knows me.", rating: 5 },
              { name: "Dr. Priya K.", role: "Therapist", text: "The Patient Brief feature means I walk into every session prepared. My patients notice the difference — they feel heard.", rating: 5 },
              { name: "Rajesh T.", role: "HR Director", text: "The burnout prediction alerted us about our QA team 3 weeks before anyone would have noticed. That saved us 4 resignations.", rating: 5 },
            ].map((t) => (
              <div key={t.name} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-accent-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-6 flex items-center space-x-3">
                  <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: CTA */}
      <section className="py-32 bg-gradient-to-b from-[#f0f4ff] to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="reveal gradient-bg rounded-[2rem] p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white animate-float" />
              <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white animate-float" style={{ animationDelay: "3s" }} />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Start your journey today.
              </h2>
              <p className="mt-6 text-xl text-white/70 max-w-lg mx-auto">
                Free to start. No credit card required. Your AI therapist is waiting.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                <Link href="/register"
                  className="px-8 py-4 bg-white text-gray-900 font-bold text-base rounded-2xl hover:bg-gray-100 transition-colors flex items-center shadow-xl">
                  Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link href="/company-signup"
                  className="px-8 py-4 border-2 border-white/40 text-white font-bold text-base rounded-2xl hover:bg-white/10 transition-colors flex items-center">
                  <Building2 className="w-5 h-5 mr-2" /> For Companies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
