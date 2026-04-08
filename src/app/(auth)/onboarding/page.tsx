"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Leaf, ArrowRight, ArrowLeft, CheckCircle, Heart,
  Brain, Moon, Dumbbell, Users, Shield, Sparkles,
} from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

const STEPS = [
  "Welcome",
  "Your Goals",
  "Current State",
  "Lifestyle",
  "Therapy Preferences",
  "Concerns",
  "Emergency Contact",
  "Complete",
];

const GOALS = [
  { id: "anxiety", label: "Manage Anxiety", icon: <Brain className="w-5 h-5" /> },
  { id: "depression", label: "Overcome Depression", icon: <Heart className="w-5 h-5" /> },
  { id: "sleep", label: "Improve Sleep", icon: <Moon className="w-5 h-5" /> },
  { id: "stress", label: "Reduce Stress", icon: <Shield className="w-5 h-5" /> },
  { id: "relationships", label: "Better Relationships", icon: <Users className="w-5 h-5" /> },
  { id: "fitness", label: "Physical Wellness", icon: <Dumbbell className="w-5 h-5" /> },
  { id: "self-esteem", label: "Build Confidence", icon: <Sparkles className="w-5 h-5" /> },
  { id: "grief", label: "Process Grief/Loss", icon: <Heart className="w-5 h-5" /> },
  { id: "trauma", label: "Trauma Recovery", icon: <Shield className="w-5 h-5" /> },
  { id: "mindfulness", label: "Mindfulness & Meditation", icon: <Brain className="w-5 h-5" /> },
  { id: "career", label: "Career & Work Balance", icon: <Sparkles className="w-5 h-5" /> },
  { id: "family", label: "Family Wellness", icon: <Users className="w-5 h-5" /> },
];

const CONCERNS = [
  "Persistent sadness or low mood",
  "Excessive worrying or fear",
  "Difficulty sleeping or oversleeping",
  "Loss of interest in activities",
  "Irritability or anger outbursts",
  "Difficulty concentrating",
  "Changes in appetite or weight",
  "Social withdrawal or isolation",
  "Substance use concerns",
  "Relationship conflicts",
  "Work/school performance issues",
  "Physical symptoms (headaches, fatigue)",
  "Panic attacks",
  "Traumatic experiences",
  "Self-harm thoughts",
];

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    primaryGoals: [] as string[],
    stressLevel: 5,
    sleepQuality: 5,
    exerciseFreq: "",
    therapyHistory: "",
    preferredStyle: "",
    concerns: [] as string[],
    emergencyContact: { name: "", phone: "", relationship: "" },
    ageGroup: "",
    gender: "",
  });

  const toggleGoal = (id: string) => {
    setForm((p) => ({
      ...p,
      primaryGoals: p.primaryGoals.includes(id)
        ? p.primaryGoals.filter((g) => g !== id)
        : [...p.primaryGoals, id],
    }));
  };

  const toggleConcern = (concern: string) => {
    setForm((p) => ({
      ...p,
      concerns: p.concerns.includes(concern)
        ? p.concerns.filter((c) => c !== concern)
        : [...p.concerns, concern],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return form.primaryGoals.length > 0;
      case 2: return true;
      case 3: return form.exerciseFreq !== "";
      case 4: return form.therapyHistory !== "";
      case 5: return true;
      case 6: return true;
      default: return true;
    }
  };

  const submit = async () => {
    setSaving(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          responses: {
            ageGroup: form.ageGroup,
            gender: form.gender,
          },
        }),
      });
      setStep(7);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const goToDashboard = () => {
    if (session?.user?.role === "THERAPIST") router.push("/therapist");
    else if (session?.user?.role === "ADMIN") router.push("/admin");
    else router.push("/patient");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img src="/logo-square.png" alt="Nishma" className="w-14 h-14 rounded-xl" />
            <span className="text-lg font-bold gradient-text">Nishma Wellness</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${
                i < step ? "bg-primary-500 w-8" : i === step ? "bg-primary-400 w-10" : "bg-gray-200 w-6"
              }`} />
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">Step {step + 1} of {STEPS.length}</p>
        </div>

        <Card className="p-8">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Welcome, {session?.user?.name?.split(" ")[0]}!
              </h1>
              <p className="text-gray-600 leading-relaxed mb-6">
                Let&apos;s personalize your wellness experience. This short questionnaire helps us
                understand your needs and match you with the right therapists and programs.
              </p>
              <p className="text-sm text-gray-400">Takes about 3-5 minutes. Your answers are completely confidential.</p>
            </div>
          )}

          {/* Step 1: Goals */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">What brings you to Nishma?</h2>
              <p className="text-gray-500 mb-6">Select all that apply. You can always update these later.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`flex items-center space-x-2 p-3 rounded-xl border-2 text-sm text-left transition-all ${
                      form.primaryGoals.includes(goal.id)
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className={form.primaryGoals.includes(goal.id) ? "text-primary-600" : "text-gray-400"}>{goal.icon}</span>
                    <span className="font-medium">{goal.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Current State */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">How are you feeling right now?</h2>
              <p className="text-gray-500 mb-4">This helps us understand your starting point.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current stress level: <span className="text-primary-600 font-bold">{form.stressLevel}/10</span>
                </label>
                <input type="range" min="1" max="10" value={form.stressLevel}
                  onChange={(e) => setForm((p) => ({ ...p, stressLevel: parseInt(e.target.value) }))}
                  className="w-full" />
                <div className="flex justify-between text-xs text-gray-400"><span>Low stress</span><span>High stress</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep quality: <span className="text-primary-600 font-bold">{form.sleepQuality}/10</span>
                </label>
                <input type="range" min="1" max="10" value={form.sleepQuality}
                  onChange={(e) => setForm((p) => ({ ...p, sleepQuality: parseInt(e.target.value) }))}
                  className="w-full" />
                <div className="flex justify-between text-xs text-gray-400"><span>Poor sleep</span><span>Excellent sleep</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                  <select value={form.ageGroup} onChange={(e) => setForm((p) => ({ ...p, ageGroup: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                    <option value="">Select</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45-54">45-54</option>
                    <option value="55-64">55-64</option>
                    <option value="65+">65+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Lifestyle */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Your Lifestyle</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">How often do you exercise?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "NEVER", label: "Rarely or never" },
                    { value: "RARELY", label: "1-2 times per week" },
                    { value: "WEEKLY", label: "3-5 times per week" },
                    { value: "DAILY", label: "Daily" },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => setForm((p) => ({ ...p, exerciseFreq: opt.value }))}
                      className={`p-3 rounded-xl border-2 text-sm text-center transition-all ${
                        form.exerciseFreq === opt.value ? "border-primary-500 bg-primary-50 text-primary-700 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Therapy Preferences */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Therapy Experience</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Have you had therapy before?</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "NEVER", label: "No, this is my first time" },
                    { value: "PAST", label: "Yes, in the past" },
                    { value: "CURRENT", label: "Yes, currently" },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => setForm((p) => ({ ...p, therapyHistory: opt.value }))}
                      className={`p-3 rounded-xl border-2 text-sm text-center transition-all ${
                        form.therapyHistory === opt.value ? "border-primary-500 bg-primary-50 text-primary-700 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">What therapeutic approach interests you?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "CBT", label: "Cognitive Behavioral (CBT)", desc: "Practical, thought-pattern focused" },
                    { value: "MINDFULNESS", label: "Mindfulness-Based", desc: "Present-moment awareness" },
                    { value: "HOLISTIC", label: "Holistic / Integrative", desc: "Mind-body-spirit approach" },
                    { value: "TALK_THERAPY", label: "Talk Therapy", desc: "Traditional conversational" },
                    { value: "UNSURE", label: "Not Sure Yet", desc: "Help me decide" },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => setForm((p) => ({ ...p, preferredStyle: opt.value }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.preferredStyle === opt.value ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"
                      }`}>
                      <p className={`text-sm font-medium ${form.preferredStyle === opt.value ? "text-primary-700" : "text-gray-700"}`}>{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Presenting Concerns */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Are you experiencing any of these?</h2>
              <p className="text-gray-500 mb-4">Select any that apply. This is confidential and helps us provide better support.</p>
              <div className="space-y-2">
                {CONCERNS.map((concern) => (
                  <button key={concern} onClick={() => toggleConcern(concern)}
                    className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${
                      form.concerns.includes(concern)
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>
                    <span className="flex items-center">
                      {form.concerns.includes(concern) && <CheckCircle className="w-4 h-4 mr-2 text-primary-600" />}
                      {concern}
                    </span>
                  </button>
                ))}
              </div>
              {form.concerns.includes("Self-harm thoughts") && (
                <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-sm text-red-800 font-medium">
                    If you&apos;re having thoughts of self-harm, please reach out for immediate help:
                  </p>
                  <p className="text-sm text-red-700 mt-1">988 Suicide & Crisis Lifeline: Call or text 988</p>
                  <p className="text-sm text-red-700">Crisis Text Line: Text HOME to 741741</p>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Emergency Contact */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Emergency Contact (Optional)</h2>
              <p className="text-gray-500 mb-4">Someone we can reach in case of emergency. This is optional but recommended.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input type="text" value={form.emergencyContact.name}
                  onChange={(e) => setForm((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, name: e.target.value } }))}
                  placeholder="Full name" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={form.emergencyContact.phone}
                  onChange={(e) => setForm((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, phone: e.target.value } }))}
                  placeholder="+1 (555) 000-0000" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select value={form.emergencyContact.relationship}
                  onChange={(e) => setForm((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, relationship: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                  <option value="">Select</option>
                  <option value="spouse">Spouse/Partner</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 7: Complete */}
          {step === 7 && (
            <div className="text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">You&apos;re All Set!</h2>
              <p className="text-gray-600 mb-6">
                Your personalized wellness profile has been created. We&apos;ll use this to match you
                with the right therapists and recommend relevant programs.
              </p>
              <div className="p-4 bg-primary-50 rounded-xl mb-6">
                <p className="text-sm text-primary-700 font-medium">Based on your responses, we recommend:</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {form.primaryGoals.slice(0, 3).map((g) => {
                    const goal = GOALS.find((gl) => gl.id === g);
                    return goal ? (
                      <span key={g} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        {goal.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              <Button onClick={goToDashboard} size="lg" className="w-full">
                Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Navigation */}
          {step < 7 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : (
                <Button variant="ghost" onClick={goToDashboard}>Skip for now</Button>
              )}
              {step < 6 ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={submit} loading={saving}>
                  Complete Setup <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
