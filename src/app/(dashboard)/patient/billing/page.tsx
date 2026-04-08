"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  CreditCard, CheckCircle, Star, Zap, Crown,
  ArrowRight, Shield, Calendar, Download,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  popular?: boolean;
  features: string[];
}

export default function PatientBilling() {
  const { status } = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/billing/plans").then((r) => r.json()).then(setPlans).catch(console.error);
    }
  }, [status]);

  const subscribe = async (planId: string) => {
    setSubscribing(planId);
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPlan(planId);
        setSuccess(data.message);
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (err) { console.error(err); }
    setSubscribing(null);
  };

  const planIcons: Record<string, React.ReactNode> = {
    free: <Shield className="w-6 h-6" />,
    starter: <Zap className="w-6 h-6" />,
    professional: <Star className="w-6 h-6" />,
    premium: <Crown className="w-6 h-6" />,
  };

  const planColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-600",
    starter: "bg-blue-100 text-blue-600",
    professional: "bg-purple-100 text-purple-600",
    premium: "bg-orange-100 text-orange-600",
  };

  const exportCalendar = () => {
    window.open("/api/calendar?format=ics", "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-500 mt-1">Manage your plan and payment methods</p>
        </div>
        <Button variant="outline" onClick={exportCalendar}>
          <Download className="w-4 h-4 mr-2" /> Export Calendar
        </Button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" /> {success}
        </div>
      )}

      {/* Current Plan */}
      <Card className="p-6 border-2 border-primary-200 bg-primary-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${planColors[currentPlan] || "bg-gray-100"}`}>
              {planIcons[currentPlan] || <Shield className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <p className="text-xl font-bold text-gray-900 capitalize">{currentPlan}</p>
            </div>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={`p-6 relative ${plan.popular ? "border-2 border-primary-500 shadow-lg" : ""}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary-600 text-white px-3">Most Popular</Badge>
              </div>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${planColors[plan.id] || "bg-gray-100"}`}>
              {planIcons[plan.id] || <Shield className="w-5 h-5" />}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
              <span className="text-gray-500 text-sm">/{plan.interval}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-gray-600 flex items-start">
                  <CheckCircle className="w-4 h-4 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {currentPlan === plan.id ? (
              <Button variant="outline" className="w-full" disabled>Current Plan</Button>
            ) : (
              <Button
                variant={plan.popular ? "primary" : "outline"}
                className="w-full"
                loading={subscribing === plan.id}
                onClick={() => subscribe(plan.id)}
              >
                {plan.price === 0 ? "Downgrade" : "Upgrade"} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* Payment Method */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" /> Payment Method
        </h2>
        <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
              VISA
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">**** **** **** 4242</p>
              <p className="text-xs text-gray-500">Expires 12/28</p>
            </div>
          </div>
          <Button size="sm" variant="outline">Update</Button>
        </div>
        <p className="text-xs text-gray-400 mt-3 flex items-center">
          <Shield className="w-3 h-3 mr-1" /> Payments are secured with 256-bit SSL encryption via Stripe.
        </p>
      </Card>

      {/* Billing History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" /> Billing History
        </h2>
        <div className="space-y-3">
          {[
            { date: "Mar 1, 2026", amount: "$0.00", plan: "Free", status: "Paid" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-500">{item.date}</span>
                <span className="font-medium text-gray-900">{item.plan} Plan</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-900">{item.amount}</span>
                <Badge variant="success">{item.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
