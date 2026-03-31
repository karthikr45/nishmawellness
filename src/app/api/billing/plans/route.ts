import { NextResponse } from "next/server";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    features: [
      "AI Wellness Chat (5 messages/day)",
      "2 Guided exercises",
      "Mood tracking",
      "1 Free assessment",
    ],
    limits: { aiChatsPerDay: 5, sessionsPerMonth: 0, programAccess: false },
  },
  {
    id: "starter",
    name: "Starter",
    price: 49,
    interval: "month",
    popular: false,
    features: [
      "Unlimited AI Wellness Chat",
      "2 Therapy sessions/month",
      "All guided exercises",
      "Unlimited assessments",
      "Daily journal",
      "Progress tracking",
    ],
    limits: { aiChatsPerDay: -1, sessionsPerMonth: 2, programAccess: false },
  },
  {
    id: "professional",
    name: "Professional",
    price: 99,
    interval: "month",
    popular: true,
    features: [
      "Everything in Starter",
      "4 Therapy sessions/month",
      "All wellness programs",
      "Group sessions access",
      "Video lesson library",
      "Priority therapist matching",
      "Family plan (add 1 member)",
    ],
    limits: { aiChatsPerDay: -1, sessionsPerMonth: 4, programAccess: true },
  },
  {
    id: "premium",
    name: "Premium",
    price: 199,
    interval: "month",
    features: [
      "Everything in Professional",
      "Unlimited therapy sessions",
      "Dedicated therapist",
      "Family plan (up to 5 members)",
      "Priority support",
      "Custom wellness plan",
      "Monthly wellness report",
    ],
    limits: { aiChatsPerDay: -1, sessionsPerMonth: -1, programAccess: true },
  },
];

export async function GET() {
  return NextResponse.json(PLANS);
}
