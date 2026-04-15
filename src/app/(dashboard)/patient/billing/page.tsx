"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  CheckCircle, Star, Zap, Crown, Shield, Sparkles, Calendar, Download,
} from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Tooltip from "@/components/ui/tooltip";

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

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/billing/plans").then((r) => r.json()).then(setPlans).catch(console.error);
    }
  }, [status]);

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
          <h1 className="text-2xl font-bold text-gray-900">Billing &amp; Plans</h1>
          <p className="text-gray-500 mt-1">Your plan, upcoming features, and payment options</p>
        </div>
        <Button variant="outline" onClick={exportCalendar}>
          <Download className="w-4 h-4 mr-2" /> Export Calendar
        </Button>
      </div>

      {/* Pilot status banner */}
      <Card className="p-6 border-2 border-primary-300 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 dark:border-primary-700">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                You&apos;re on the Free Pilot Plan
                <Tooltip
                  maxWidth={300}
                  content="During our early-access pilot, every feature is unlocked at no cost. We will give you 30 days notice before any plan goes live for you, and you can cancel anytime."
                />
              </h2>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              All features unlocked, no charges. We are running an early-access pilot — your feedback is helping us shape the product.
              Paid plans below are previews of what is coming. We will reach out before any plan goes live for you.
            </p>
          </div>
        </div>
      </Card>

      {/* Plans Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Plans coming soon</h2>
            <p className="text-sm text-gray-500 mt-0.5">Preview only — billing is disabled during the pilot.</p>
          </div>
        </div>

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
              <Button variant="outline" className="w-full" disabled>
                Available after pilot
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Calendar Export */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" /> Calendar Export
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Download your appointments as an iCal file to add them to Google Calendar, Outlook, or Apple Calendar.
        </p>
        <Button variant="outline" onClick={exportCalendar}>
          <Download className="w-4 h-4 mr-2" /> Download .ics
        </Button>
      </Card>

      {/* Pilot info */}
      <Card className="p-6 bg-gray-50 dark:bg-gray-900/50">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Want enterprise pricing?</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          If you are an HR leader or company admin exploring Nishma for your team, our sales team is happy to walk you through pricing and a tailored pilot.
        </p>
        <Link href="/request-demo">
          <Button variant="primary">Request a Demo</Button>
        </Link>
      </Card>
    </div>
  );
}
