"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle, ChevronDown, ArrowRight, Heart, GraduationCap,
  Building2, Shield, UserCheck,
} from "lucide-react";

interface FAQ {
  q: string;
  a: string;
}

interface FAQSection {
  icon: React.ReactNode;
  title: string;
  description: string;
  faqs: FAQ[];
}

const SECTIONS: FAQSection[] = [
  {
    icon: <Heart className="w-6 h-6" />,
    title: "For Individuals",
    description: "Questions about using Nishma as a person.",
    faqs: [
      {
        q: "Is Nishma a replacement for therapy?",
        a: "No. Nishma is a wellness companion that supports your journey — it includes AI check-ins, journaling, guided exercises, assessments, and the option to connect with licensed therapists. It is not a substitute for professional clinical care, especially for serious mental health conditions.",
      },
      {
        q: "What does the free plan actually give me?",
        a: "The Free plan includes AI chat with memory (limited messages per day), daily journal, mood tracking, 5 guided exercises, PHQ-9 and GAD-7 assessments, community access, and crisis support resources. No credit card needed.",
      },
      {
        q: "What happens if I share something concerning with the AI?",
        a: "Every AI conversation is screened by a safety layer. If you share thoughts of self-harm or crisis, the AI will pause the normal conversation and immediately provide crisis hotline numbers for your region (988 in the US, 1860-2662-345 Vandrevala Foundation in India, and others). High-severity events are flagged for human review.",
      },
      {
        q: "Can I use Nishma in my language?",
        a: "Yes. Nishma currently supports 10 languages including English, Hindi, Spanish, French, German, Portuguese, Mandarin, Japanese, Korean, and Arabic. You can switch languages any time from your profile.",
      },
      {
        q: "How does the AI remember me?",
        a: "As you chat, the AI extracts key topics (e.g. work stress, sleep issues), life events, coping tools that work for you, and patterns. These memories are stored privately in your account and referenced in future conversations — so you do not have to start over every time.",
      },
      {
        q: "Can I delete my data?",
        a: "Yes. From your Privacy page, you can export all your data in a structured format, or delete your entire account or specific categories (chats, journals, assessments) with full audit logging. You are always in control.",
      },
    ],
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: "For Students",
    description: "Campus plans, career tools, and student pricing.",
    faqs: [
      {
        q: "Can my college see what I share?",
        a: "No. Even if your campus sponsors your Nishma access, your individual journal, AI chats, and assessment data are completely private. The campus only sees anonymous aggregate statistics — like overall wellness trends across the student body.",
      },
      {
        q: "How does the student pricing work?",
        a: "Student pricing starts at ₹149/month (or local equivalent). If your campus has a partnership with Nishma, you may have free or subsidised access — check the Join Campus page or with your student wellness office.",
      },
      {
        q: "What is the Career Explorer?",
        a: "A career interest assessment with 8 career clusters. Based on your responses, Nishma suggests compatible career paths and builds interview-prep wellness plans that account for exam and placement stress.",
      },
      {
        q: "Is it really confidential from my parents?",
        a: "Yes, for adult students. If you are a minor in a family plan, there are special privacy protections and age-appropriate safeguards — but the core confidentiality of your journal and therapy is still maintained.",
      },
    ],
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: "For Companies",
    description: "Pilot programs, pricing, and HR dashboards.",
    faqs: [
      {
        q: "How much does the company plan cost?",
        a: "Company pricing is customised based on team size, session volume, and which modules you need (therapist access, burnout prediction, pulse surveys, etc.). Request a demo to get a quote.",
      },
      {
        q: "What do our employees actually get access to?",
        a: "Everything individuals get — AI chat, journaling, assessments, exercises — plus a pre-allocated number of video therapy sessions with licensed therapists per year (typically 12). Plans can include family members depending on your tier.",
      },
      {
        q: "What does HR see in the dashboard?",
        a: "HR sees anonymous aggregate analytics only: wellness trends by department or location, burnout risk scores, pulse survey results, challenge participation, and critical incident counts (never individual names). Individual data never reaches HR.",
      },
      {
        q: "How does burnout prediction work?",
        a: "Our AI analyses aggregate engagement patterns, mood trends, and wellness signals to identify at-risk departments before burnout hits. Alerts flag teams trending toward high risk so HR can intervene proactively.",
      },
      {
        q: "Can we run a pilot before committing?",
        a: "Yes. We work with early partners on 60-90 day pilot programs with clear success metrics. Request a demo to discuss pilot options for your organisation.",
      },
      {
        q: "How long does implementation take?",
        a: "For typical teams, go-live takes 1-2 weeks: setup of your organisation profile, employee invite codes, custom welcome messaging, and a kickoff session. We handle the heavy lifting — you handle the internal comms.",
      },
      {
        q: "Do you integrate with SSO or our HRIS?",
        a: "SSO (SAML, OIDC) and HRIS integrations (Workday, BambooHR, SAP SuccessFactors) are on our roadmap. Specific integrations can be accelerated for pilot customers — please discuss with us during the demo.",
      },
    ],
  },
  {
    icon: <UserCheck className="w-6 h-6" />,
    title: "For Therapists",
    description: "Joining the network and practising on Nishma.",
    faqs: [
      {
        q: "How do I apply to be a therapist on Nishma?",
        a: "Email us at therapists@nishmawellness.com with your license details, specialisations, and a brief intro. We verify credentials with the relevant licensing boards before approving any therapist.",
      },
      {
        q: "What is TwinClone and do I have to use it?",
        a: "TwinClone is an optional AI feature where therapists can configure an AI assistant that reflects their approach for between-session support with patients. You can enable or disable it at any time, and every interaction is available for your review.",
      },
      {
        q: "How are payments handled?",
        a: "Earnings are tracked on your dashboard and paid out on a regular cycle. Payment processing details will be finalised during onboarding.",
      },
    ],
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Privacy &amp; Security",
    description: "How your data is protected.",
    faqs: [
      {
        q: "Is Nishma HIPAA compliant?",
        a: "Nishma is designed with HIPAA best practices and privacy-by-design principles. However, a formal HIPAA BAA (Business Associate Agreement) is on our roadmap for US enterprise customers and is not yet in effect. For US healthcare-regulated PHI workflows, please wait for our HIPAA-ready tier. See our Security page for full details.",
      },
      {
        q: "Where is my data stored?",
        a: "On secure, isolated cloud infrastructure. All traffic is encrypted in transit (TLS 1.3). Sensitive fields will have field-level encryption at rest for enterprise deployments. See our Security page.",
      },
      {
        q: "Can I delete everything?",
        a: "Yes. Go to your Privacy page inside the app. You can export all your data or delete your account and all associated records. Deletion is audit-logged and permanent.",
      },
      {
        q: "Who sees my data?",
        a: "Only you, and only those you explicitly opt to share with (your therapist, family members in your plan). Employers and campuses see anonymous aggregates only. Nishma does not sell or share your data with third parties.",
      },
    ],
  },
];

function AccordionItem({ q, a }: FAQ) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
      >
        <span className="font-semibold text-gray-900 dark:text-white pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{a}</div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[40vh] flex items-center bg-[#1a1832] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1832] via-[#1e1d3a] to-[#141830]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#80A8FF]/10 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-16 text-center w-full">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-primary-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <HelpCircle className="w-4 h-4 mr-2" /> Frequently Asked Questions
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Everything you
            <br />
            <span className="bg-gradient-to-r from-[#80A8FF] via-[#CEB5FF] to-[#8EC1DE] bg-clip-text text-transparent">
              want to know.
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
            Answers grouped by who you are. Did not find what you need? <Link href="/request-demo" className="text-primary-400 hover:underline">Contact us</Link>.
          </p>
        </div>
      </section>

      {/* FAQ SECTIONS */}
      <section className="py-20 bg-gradient-to-b from-white to-[#f8f7ff] dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-6 space-y-16">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="flex items-start space-x-4 mb-8">
                <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{section.title}</h2>
                  <p className="mt-1 text-gray-500">{section.description}</p>
                </div>
              </div>
              <div className="space-y-3">
                {section.faqs.map((faq) => (
                  <AccordionItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-[#f8f7ff] to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="gradient-bg rounded-[2rem] p-14 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-extrabold">Still have questions?</h2>
            <p className="mt-4 text-lg text-white/80 max-w-lg mx-auto">
              We are happy to walk you through anything — no pressure to commit.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link href="/request-demo" className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-colors flex items-center shadow-xl">
                Book a Demo <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/register" className="px-8 py-4 border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors">
                Try Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
