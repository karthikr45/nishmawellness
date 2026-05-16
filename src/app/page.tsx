"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  Brain, ArrowRight, Building2, Sparkles, Shield, GraduationCap,
  Heart, CheckCircle, Clock, Users, Video, Moon, Wind, Target,
  Flame, MapPin, Baby, Star, TrendingUp, BarChart3, MessageSquare,
  Zap, Award, PenLine,
} from "lucide-react";
import Button from "@/components/ui/button";

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

      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#1a1832]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1832] via-[#1e1d3a] to-[#141830]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#80A8FF]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#CEB5FF]/8 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-primary-400 text-sm font-medium mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Early Access — Join the first cohort
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
                AI therapy that remembers your story. Kids health tracking that grows with them.
                Family habits that build daily bonds. Enterprise analytics that prevent burnout.
                <strong className="text-white"> One platform for every generation.</strong>
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 mt-10">
                <Link href="/register"
                  className="px-8 py-4 bg-gradient-to-r from-[#6690f5] to-[#8560d4] text-white font-bold text-base rounded-2xl hover:from-[#4d73e0] hover:to-[#6d48b8] transition-all shadow-2xl shadow-[#80A8FF]/25 flex items-center">
                  Start Free — No Card Required <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link href="/request-demo"
                  className="px-8 py-4 border border-white/20 text-white font-semibold text-base rounded-2xl hover:bg-white/5 transition-all flex items-center backdrop-blur-sm">
                  <Building2 className="w-5 h-5 mr-2 text-primary-400" /> For Companies
                </Link>
              </div>

              <div className="flex items-center gap-8 mt-12">
                {[
                  { value: "Memory-First", label: "AI Architecture" },
                  { value: "10 Languages", label: "India + Global" },
                  { value: "Privacy-First", label: "By Design" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-lg font-extrabold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual — App preview */}
            <div className="animate-fade-in-up hidden lg:block" style={{ animationDelay: "0.3s" }}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" /></div>
                    <span className="text-xs text-gray-500 font-mono">nishma wellness</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0"><Brain className="w-4 h-4 text-white" /></div>
                      <div className="bg-white/10 rounded-2xl rounded-tl-md p-4 max-w-[85%]">
                        <p className="text-sm text-gray-200 leading-relaxed">Welcome back, Priya. Last session you mentioned the deadline with your manager was stressing you out. You committed to trying the breathing exercise. How did it go?</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary-600 rounded-2xl rounded-tr-md p-4 max-w-[75%]">
                        <p className="text-sm text-white leading-relaxed">It actually helped! I did the 4-7-8 breathing before the meeting and felt much calmer.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0"><Brain className="w-4 h-4 text-white" /></div>
                      <div className="bg-white/10 rounded-2xl rounded-tl-md p-4 max-w-[85%]">
                        <p className="text-sm text-gray-200 leading-relaxed">That&apos;s wonderful progress! I&apos;ve noticed anxiety has come up in 5 of our conversations. But your coping is getting stronger each time. 💪</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center"><p className="text-lg font-bold text-primary-400">47</p><p className="text-[10px] text-gray-500">Sessions</p></div>
                      <div className="text-center"><p className="text-lg font-bold text-green-400">↑ 23%</p><p className="text-[10px] text-gray-500">Mood</p></div>
                      <div className="text-center"><p className="text-lg font-bold text-accent-400">12</p><p className="text-[10px] text-gray-500">Day Streak</p></div>
                    </div>
                    <div className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">Mood: Improving</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-start justify-center pt-2"><div className="w-1.5 h-3 bg-gray-400 rounded-full" /></div>
        </div>
      </section>

      {/* ============ WHO IS IT FOR ============ */}
      <section className="py-24 bg-gradient-to-b from-[#f8f7ff] to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Built for <span className="gradient-text">every generation.</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">One platform for your whole life — from your first breathing exercise to your family&apos;s 1,000th gratitude message.</p>
          </div>

          <div className="reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Users className="w-7 h-7" />, title: "Individuals", desc: "AI therapy that remembers you. Journal, assessments, exercises, sleep tools. Start free.", color: "from-blue-500 to-primary-500" },
              { icon: <Heart className="w-7 h-7" />, title: "Couples & Families", desc: "Daily check-ins, kids health tracking, family habits with streaks, shared gratitude circle.", color: "from-pink-500 to-rose-500" },
              { icon: <GraduationCap className="w-7 h-7" />, title: "Students", desc: "Exam stress management, career explorer, interview prep wellness. From ₹149/month.", color: "from-purple-500 to-secondary-500" },
              { icon: <Building2 className="w-7 h-7" />, title: "Companies", desc: "Burnout prediction, wellness heatmap, anonymous feedback. Saves ₹15-30L per prevented resignation.", color: "from-emerald-500 to-green-500" },
            ].map((item) => (
              <div key={item.title} className="reveal hover-lift bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg mb-5`}>{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="mt-3 text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SESSION 47 COMPARISON ============ */}
      <section className="py-24 bg-gradient-to-b from-white to-[#f8f7ff] dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#D3D3FF]/20 rounded-full blur-[120px]" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Every session feels <span className="gradient-text">personal.</span></h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">Our AI remembers your story, your struggles, your progress — and picks up exactly where you left off.</p>
          </div>
          <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 rounded-3xl p-8">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-6">Every Other App — Session 47</p>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm max-w-[85%]"><p className="text-sm text-gray-600">Hi! How can I help you today?</p></div>
                <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-xl max-w-[85%] ml-auto"><p className="text-sm text-gray-700">I told you last week about my boss. The meeting happened.</p></div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm max-w-[85%]"><p className="text-sm text-gray-600">I&apos;m sorry, I don&apos;t have context from previous conversations. Could you tell me more?</p></div>
              </div>
              <p className="text-sm text-red-500 font-semibold mt-6">Starts over. Every. Single. Time.</p>
            </div>
            <div className="bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200/50 dark:border-primary-800/30 rounded-3xl p-8">
              <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-6">Nishma — Session 47</p>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm max-w-[85%]"><p className="text-sm text-gray-700">Last week, you said you were going to have that conversation with your manager Sarah. You&apos;d avoided it twice before. Did you have it?</p></div>
                <div className="bg-primary-600 text-white p-4 rounded-xl max-w-[85%] ml-auto"><p className="text-sm">It actually went better than I expected.</p></div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm max-w-[85%]"><p className="text-sm text-gray-700">That matters. Two weeks ago you told me you were most scared of her reaction. What was it like in reality versus what you imagined?</p></div>
              </div>
              <p className="text-sm text-primary-600 font-semibold mt-6">Sees the pattern. Tracks the progress. Helps you resolve.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES (comprehensive — 12 features) ============ */}
      <section className="py-24 bg-gradient-to-b from-[#f8f7ff] to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Everything your family needs.<br /><span className="gradient-text">Nothing you don&apos;t.</span></h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">From AI therapy to kids&apos; growth charts to couple goals — a single app for your whole household.</p>
          </div>

          <div className="reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Brain className="w-6 h-6" />, title: "AI That Remembers", desc: "Deep memory extracts topics, events, coping tools, triggers from every conversation. Month 6 feels more personal than month 1.", color: "bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400" },
              { icon: <Video className="w-6 h-6" />, title: "Video Therapy", desc: "Licensed therapists, goal-matched. Your therapist sees an AI brief before every session so they start prepared.", color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
              { icon: <Sparkles className="w-6 h-6" />, title: "TwinClone", desc: "Your therapist's AI assistant — trained on their approach. Available 24/7 between sessions. Not a replacement, a bridge.", color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
              { icon: <Baby className="w-6 h-6" />, title: "Kids Health Tracker", desc: "Mood, food, sleep, growth, milestones — tracked daily. Show your pediatrician real patterns, not guesses.", color: "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400" },
              { icon: <Flame className="w-6 h-6" />, title: "Family Habits + Streaks", desc: "Daily family checklist. Streaks build. Kids compete with parents. 45-day streak? Nobody wants to break it.", color: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400" },
              { icon: <Heart className="w-6 h-6" />, title: "Couples Wellness", desc: "Daily check-ins (communication, connection, conflict). Shared journal. Love languages. Gratitude circle.", color: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400" },
              { icon: <Target className="w-6 h-6" />, title: "Family Goals", desc: "'No screens at dinner for 30 days.' Progress bar fills. Whole family sees. Accountability built in.", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" },
              { icon: <Wind className="w-6 h-6" />, title: "Exercises & Meditation", desc: "6 types: breathing, meditation, body scan, grounding, PMR, visualization. Interactive timers. Post-session rating.", color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400" },
              { icon: <Moon className="w-6 h-6" />, title: "Sleep & Focus", desc: "Soundscapes (rain, ocean, campfire). Sleep stories. Binaural beats. Pomodoro focus timer with contextual tips.", color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
              { icon: <MapPin className="w-6 h-6" />, title: "My Neighbourhood", desc: "Local wellness events: park yoga, walking groups, meditation circles. Anonymous. Moderated. Real connections near you.", color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" },
              { icon: <BarChart3 className="w-6 h-6" />, title: "HR Burnout Prediction", desc: "Wellness heatmap by department. Identify at-risk teams 3 weeks before resignations. 100% anonymous for employees.", color: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
              { icon: <Shield className="w-6 h-6" />, title: "Privacy by Design", desc: "GDPR + DPDP compliant. Employers see only aggregates. Family members see only shared items. Delete anything anytime.", color: "bg-gray-50 text-gray-600 dark:bg-gray-950 dark:text-gray-400" },
            ].map((f) => (
              <div key={f.title} className="reveal hover-lift bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-7">
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-4`}>{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY PEOPLE PAY ============ */}
      <section className="py-24 bg-gradient-to-b from-white to-[#f0f4ff] dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="reveal text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Why people <span className="gradient-text">stay and pay.</span></h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">Free forever for basics. Upgrade when Nishma becomes part of your family&apos;s daily routine.</p>
          </div>

          <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: <TrendingUp className="w-6 h-6" />, title: "Your data becomes irreplaceable", desc: "12 months of your child's mood, growth, food habits. Your couple's gratitude history. Your PHQ-9 improvement curve. You can't get this anywhere else — and you can't recreate it." },
              { icon: <Flame className="w-6 h-6" />, title: "Streaks you don't want to break", desc: "Day 45 of 'family dinner together'. Your daughter's 30-day exercise streak. The gratitude message your wife looks forward to every night. Breaking it feels like losing something real." },
              { icon: <Users className="w-6 h-6" />, title: "Family accountability", desc: "When your partner can see you skipped your meditation, when your kids see you didn't log your mood — social pressure works. Everyone keeps going because everyone can see." },
              { icon: <Brain className="w-6 h-6" />, title: "AI that gets better with time", desc: "Month 1: generic responses. Month 6: remembers your triggers, your coping tools, your family dynamics, your progress. Leaving means starting over with a stranger." },
              { icon: <Zap className="w-6 h-6" />, title: "Cheaper than the alternative", desc: "One therapy session: ₹1,500-3,000. One employee resignation: ₹10-15 lakh. One sick day: ₹2,000. Nishma Plus: ₹13/day. The math is obvious." },
              { icon: <Award className="w-6 h-6" />, title: "Visible, measurable progress", desc: "PHQ-9 dropped from 14 to 8. Sleep quality up 30%. Family goal 87% complete. When you can SEE it working, you don't cancel." },
            ].map((item) => (
              <div key={item.title} className="reveal bg-white dark:bg-gray-800 rounded-2xl p-7 border border-gray-100 dark:border-gray-700">
                <div className="w-11 h-11 gradient-bg rounded-xl flex items-center justify-center text-white mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOR COMPANIES ============ */}
      <section className="py-24 bg-gradient-to-b from-[#f0f4ff] to-white dark:from-gray-950 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-[#80A8FF]/10 rounded-full blur-[120px]" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="reveal grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1.5 bg-accent-100 dark:bg-accent-950 rounded-full text-accent-700 dark:text-accent-300 text-sm font-medium mb-6"><Building2 className="w-4 h-4 mr-2" /> For Companies</div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">Predict burnout<br /><span className="gradient-text">before it costs you.</span></h2>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">One resignation costs ₹10-15 lakh. Our AI identifies at-risk teams 3 weeks before symptoms — saving you lakhs per prevented exit.</p>
              <ul className="mt-8 space-y-4">
                {["Department wellness heatmap (red/yellow/green)", "Burnout risk prediction with trend alerts", "Anonymous feedback inbox for honest signals", "Peer recognition + team challenges for engagement", "100% anonymized — individual data never exposed to HR"].map((item) => (
                  <li key={item} className="flex items-start space-x-3"><CheckCircle className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" /><span className="text-gray-600 dark:text-gray-300">{item}</span></li>
                ))}
              </ul>
              <div className="flex items-center gap-4 mt-8">
                <Link href="/request-demo"><Button size="lg" className="rounded-2xl">Request a Demo <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
                <Link href="/pricing" className="text-sm text-primary-600 hover:underline font-medium">See pricing from ₹100/employee/month →</Link>
              </div>
            </div>
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
                    <div className="flex items-center space-x-3"><div className={`w-3 h-3 rounded-full ${d.color}`} /><span className="text-sm font-medium text-gray-700 dark:text-gray-300">{d.dept}</span></div>
                    <div className="flex items-center space-x-3"><div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2"><div className={`${d.color} h-2 rounded-full`} style={{ width: `${d.mood}%` }} /></div><span className="text-xs text-gray-500 w-8">{d.mood}%</span></div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">Alert: Compliance team showing critical burnout risk. 3 of 8 employees flagged.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING PREVIEW ============ */}
      <section className="py-24 bg-gradient-to-b from-white to-[#f8f5ff] dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="reveal text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Simple pricing.<br /><span className="gradient-text">Start free. Upgrade when ready.</span></h2>
          </div>

          <div className="reveal grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { plan: "Free", price: "₹0", period: "forever", features: ["AI chat (15/day)", "Journal + mood", "5 exercises", "Assessments (1/month)", "Community (read)"], cta: "Start Free", href: "/register", popular: false },
              { plan: "Plus", price: "₹399", period: "/month", features: ["Unlimited AI + memory", "All exercises & programs", "Sleep stories + sounds", "Insights + progress", "Neighbourhood + career"], cta: "Start Plus", href: "/register", popular: true },
              { plan: "Family", price: "₹999", period: "/month", features: ["Plus for 5 members", "Kids health tracking", "Habits + streaks + goals", "Couples module", "Gratitude circle"], cta: "Start Family", href: "/register", popular: false },
            ].map((p) => (
              <div key={p.plan} className={`reveal bg-white dark:bg-gray-800 rounded-3xl p-7 border text-center ${p.popular ? "border-primary-500 shadow-xl md:scale-105" : "border-gray-100 dark:border-gray-700"}`}>
                {p.popular && <span className="px-4 py-1 gradient-bg text-white text-xs font-bold rounded-full shadow-md inline-block mb-4">MOST POPULAR</span>}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{p.plan}</h3>
                <div className="mt-3"><span className="text-4xl font-extrabold text-gray-900 dark:text-white">{p.price}</span><span className="text-gray-500 ml-1">{p.period}</span></div>
                <ul className="mt-6 space-y-2.5 text-left">
                  {p.features.map((f) => (<li key={f} className="flex items-start space-x-2 text-sm"><CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" /><span className="text-gray-600 dark:text-gray-300">{f}</span></li>))}
                </ul>
                <Link href={p.href} className={`mt-6 block text-center px-5 py-3 rounded-xl font-semibold transition-colors ${p.popular ? "gradient-bg text-white hover:opacity-90" : "border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"}`}>{p.cta}</Link>
              </div>
            ))}
          </div>

          <div className="reveal mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
            <span>Therapy: from ₹999/session</span>
            <span className="hidden sm:inline">•</span>
            <span>Students: ₹149/month</span>
            <span className="hidden sm:inline">•</span>
            <span>Companies: from ₹100/employee/month</span>
            <span className="hidden sm:inline">•</span>
            <Link href="/pricing" className="text-primary-600 font-semibold hover:underline">See full pricing →</Link>
          </div>
        </div>
      </section>

      {/* ============ FOUNDERS ============ */}
      <section id="about" className="py-24 bg-gradient-to-b from-[#f8f5ff] to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Meet the <span className="gradient-text">founders.</span></h2>
          </div>
          <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { name: "Sesha Sai Nishma Kurapati", role: "Co-Founder", initials: "SN", bio: "Driving the product vision — so every user feels heard from day one to day 1,000." },
              { name: "Karthik Reddycharla", role: "Co-Founder", initials: "KR", bio: "Leading engineering and AI — building the memory architecture and enterprise infrastructure." },
            ].map((f) => (
              <div key={f.name} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 hover-lift">
                <div className="flex items-start space-x-5">
                  <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">{f.initials}</div>
                  <div className="flex-1"><h3 className="text-xl font-bold text-gray-900 dark:text-white">{f.name}</h3><p className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-0.5">{f.role}</p><p className="mt-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{f.bio}</p></div>
                </div>
              </div>
            ))}
          </div>
          <div className="reveal mt-12 flex flex-col items-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">Powered By</p>
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"><Sparkles className="w-5 h-5 text-primary-500" /><span className="text-lg font-bold text-gray-900 dark:text-white">MK Tech Monk</span></div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-24 bg-gradient-to-b from-white to-[#f0f4ff] dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="reveal gradient-bg rounded-[2rem] p-12 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"><div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white animate-float" /><div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white animate-float" style={{ animationDelay: "3s" }} /></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Start your family&apos;s<br />wellness journey today.</h2>
              <p className="mt-6 text-xl text-white/80 max-w-lg mx-auto">Free forever for individuals. ₹13/day for the full family. No credit card required to start.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                <Link href="/register" className="px-8 py-4 bg-white text-gray-900 font-bold text-base rounded-2xl hover:bg-gray-100 transition-colors flex items-center shadow-xl">Get Started Free <ArrowRight className="w-5 h-5 ml-2" /></Link>
                <Link href="/request-demo" className="px-8 py-4 border-2 border-white/40 text-white font-bold text-base rounded-2xl hover:bg-white/10 transition-colors flex items-center"><Building2 className="w-5 h-5 mr-2" /> For Companies</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
