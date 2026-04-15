"use client";

import { useEffect, useState } from "react";
import { Shield, X, ArrowRight } from "lucide-react";
import Link from "next/link";

const DISMISS_KEY = "nishma:privacy-banner-dismissed";
const VIEW_COUNT_KEY = "nishma:privacy-banner-views";
const MAX_VIEWS = 3;

interface ProfileResp {
  organizationId?: string | null;
  campusId?: string | null;
}

/**
 * Privacy reassurance banner shown to patients who joined through a company or campus.
 * Appears on the dashboard for the first 3 visits, then auto-hides.
 * Can be manually dismissed at any time.
 */
export default function PrivacyBanner() {
  const [show, setShow] = useState(false);
  const [orgType, setOrgType] = useState<"company" | "campus" | null>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY) === "true";
    if (dismissed) return;

    const views = parseInt(localStorage.getItem(VIEW_COUNT_KEY) || "0", 10);
    if (views >= MAX_VIEWS) return;

    fetch("/api/users/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ProfileResp | null) => {
        if (data?.organizationId) {
          setOrgType("company");
          setShow(true);
          localStorage.setItem(VIEW_COUNT_KEY, String(views + 1));
        } else if (data?.campusId) {
          setOrgType("campus");
          setShow(true);
          localStorage.setItem(VIEW_COUNT_KEY, String(views + 1));
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setShow(false);
  };

  if (!show || !orgType) return null;

  const audience = orgType === "company" ? "your employer" : "your campus";

  return (
    <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border border-green-200 dark:border-green-800 rounded-2xl p-5">
      <button
        onClick={handleDismiss}
        aria-label="Dismiss privacy banner"
        className="absolute top-3 right-3 text-green-600/60 hover:text-green-700 dark:text-green-400/60 dark:hover:text-green-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start space-x-4 pr-6">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            Your data is private from {audience}.
          </h3>
          <p className="mt-1.5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Your journal entries, AI conversations, assessments, and therapist notes are <strong>never visible</strong> to {audience}.
            They only see anonymous aggregate statistics — like overall wellness trends across the team.
          </p>
          <Link
            href="/patient/data-privacy"
            className="mt-2.5 inline-flex items-center text-sm font-semibold text-green-700 dark:text-green-300 hover:underline"
          >
            See exactly what is shared <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
