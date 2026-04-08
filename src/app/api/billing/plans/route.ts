import { NextRequest, NextResponse } from "next/server";

const PLANS_USD = [
  { id: "free", name: "Free", price: 0, currency: "USD", interval: "month",
    features: ["AI Wellness Chat (5 messages/day)", "2 Guided exercises", "Mood tracking", "1 Free assessment"],
    limits: { aiChatsPerDay: 5, sessionsPerMonth: 0, programAccess: false } },
  { id: "starter", name: "Starter", price: 49, currency: "USD", interval: "month",
    features: ["Unlimited AI Wellness Chat", "2 Therapy sessions/month", "All guided exercises", "Unlimited assessments", "Daily journal", "Progress tracking"],
    limits: { aiChatsPerDay: -1, sessionsPerMonth: 2, programAccess: false } },
  { id: "professional", name: "Professional", price: 99, currency: "USD", interval: "month", popular: true,
    features: ["Everything in Starter", "4 Therapy sessions/month", "All wellness programs", "Group sessions access", "Video lesson library", "Priority therapist matching", "Family plan (add 1 member)"],
    limits: { aiChatsPerDay: -1, sessionsPerMonth: 4, programAccess: true } },
  { id: "premium", name: "Premium", price: 199, currency: "USD", interval: "month",
    features: ["Everything in Professional", "Unlimited therapy sessions", "Dedicated therapist", "Family plan (up to 5 members)", "Priority support", "Custom wellness plan", "Monthly wellness report"],
    limits: { aiChatsPerDay: -1, sessionsPerMonth: -1, programAccess: true } },
];

const PLANS_INR = [
  { id: "free", name: "Free", price: 0, currency: "INR", interval: "month",
    features: ["AI Wellness Chat (5 messages/day)", "2 Guided exercises", "Mood tracking", "1 Free assessment"],
    limits: { aiChatsPerDay: 5, sessionsPerMonth: 0, programAccess: false } },
  { id: "lite", name: "Lite", price: 299, currency: "INR", interval: "month",
    features: ["Unlimited AI Wellness Chat", "All guided exercises", "Unlimited assessments", "Daily journal", "Progress tracking", "Community access"],
    limits: { aiChatsPerDay: -1, sessionsPerMonth: 0, programAccess: false } },
  { id: "standard", name: "Standard", price: 799, currency: "INR", interval: "month", popular: true,
    features: ["Everything in Lite", "2 Therapy sessions/month", "All wellness programs", "Group sessions access", "Video lesson library", "Academic stress tools"],
    limits: { aiChatsPerDay: -1, sessionsPerMonth: 2, programAccess: true } },
  { id: "pro", name: "Pro", price: 1999, currency: "INR", interval: "month",
    features: ["Everything in Standard", "4 Therapy sessions/month", "Priority therapist matching", "Family plan (add 2 members)", "TwinClone AI access", "Monthly wellness report"],
    limits: { aiChatsPerDay: -1, sessionsPerMonth: 4, programAccess: true } },
  { id: "unlimited", name: "Unlimited", price: 4999, currency: "INR", interval: "month",
    features: ["Everything in Pro", "Unlimited therapy sessions", "Dedicated therapist", "Family plan (up to 5)", "Priority support", "Custom wellness plan"],
    limits: { aiChatsPerDay: -1, sessionsPerMonth: -1, programAccess: true } },
];

const STUDENT_PLANS = [
  { id: "student_free", name: "Student Free", price: 0, currency: "INR", interval: "month",
    features: ["AI Wellness Chat (10 messages/day)", "All guided exercises", "Mood & journal tracking", "Academic stress tools", "Community access"],
    limits: { aiChatsPerDay: 10, sessionsPerMonth: 0, programAccess: false } },
  { id: "student_plus", name: "Student Plus", price: 149, currency: "INR", interval: "month", popular: true,
    features: ["Unlimited AI Chat", "1 Therapy session/month", "All wellness programs", "Group sessions", "Focus timer", "Exam coping tools"],
    limits: { aiChatsPerDay: -1, sessionsPerMonth: 1, programAccess: true } },
  { id: "student_pro", name: "Student Pro", price: 399, currency: "INR", interval: "month",
    features: ["Everything in Plus", "2 Therapy sessions/month", "TwinClone AI", "Priority counselor matching", "Family shared view"],
    limits: { aiChatsPerDay: -1, sessionsPerMonth: 2, programAccess: true } },
];

const CAMPUS_PLANS = [
  { id: "campus_basic", name: "Campus Basic", price: 30, currency: "INR", interval: "student/month", perStudent: true,
    features: ["AI Chat for all students", "Guided exercises", "Mood tracking", "Anonymous wellness reports", "Crisis detection alerts"],
    limits: {} },
  { id: "campus_plus", name: "Campus Plus", price: 60, currency: "INR", interval: "student/month", popular: true, perStudent: true,
    features: ["Everything in Basic", "2 counseling sessions/student/semester", "Wellness programs", "Pulse surveys", "Department analytics", "Peer mentoring tools"],
    limits: {} },
  { id: "campus_pro", name: "Campus Pro", price: 100, currency: "INR", interval: "student/month", perStudent: true,
    features: ["Everything in Plus", "Unlimited counseling", "TwinClone AI", "Custom programs", "Parent dashboard", "API integration with LMS"],
    limits: {} },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") || "US";
  const type = searchParams.get("type") || "individual"; // individual, student, campus, corporate

  switch (type) {
    case "student":
      return NextResponse.json(STUDENT_PLANS);
    case "campus":
      return NextResponse.json(CAMPUS_PLANS);
    case "individual":
    default:
      return NextResponse.json(region === "IN" ? PLANS_INR : PLANS_USD);
  }
}
