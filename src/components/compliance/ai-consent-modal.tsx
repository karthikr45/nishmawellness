"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle, AlertTriangle, Brain, Lock, Heart } from "lucide-react";
import Button from "@/components/ui/button";

export default function AIConsentModal({ onConsent }: { onConsent: () => void }) {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  useEffect(() => {
    fetch("/api/compliance/consent")
      .then((r) => r.json())
      .then((data) => {
        if (data.hasConsent) {
          setHasConsent(true);
          onConsent();
        } else {
          setHasConsent(false);
        }
      })
      .catch(() => setHasConsent(false));
  }, [onConsent]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 20) {
      setScrolledToBottom(true);
    }
  };

  const accept = async () => {
    setAccepting(true);
    await fetch("/api/compliance/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consentType: "ADULT" }),
    });
    setHasConsent(true);
    onConsent();
    setAccepting(false);
  };

  if (hasConsent === null) return null; // Loading
  if (hasConsent) return null; // Already consented

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Before We Begin</h2>
              <p className="text-sm text-gray-500">Important information about AI wellness support</p>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" onScroll={handleScroll}>
          <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-950 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">Not a Replacement for Therapy</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">This AI provides wellness support but is NOT a licensed therapist. In emergencies, call 988 or 911.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-xl">
            <Brain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">No Diagnoses or Prescriptions</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">The AI cannot diagnose conditions or recommend medication. Medical decisions should be made with qualified professionals.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-950 rounded-xl">
            <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">Your Data is Protected</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Conversations are stored securely (HIPAA-compliant). You can delete your data anytime from Settings &gt; Data Privacy.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-xl">
            <Heart className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">Therapist TwinClone</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">If using a therapist&apos;s AI clone, they may review conversations to improve your care. Session notes remain confidential.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-xl">
            <Shield className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">Safety Boundaries</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">The AI will only discuss wellness and mental health topics. It will redirect you to professionals for medical, legal, or off-topic questions.</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-xs text-gray-500 leading-relaxed">
              This service follows APA (American Psychological Association) guidelines, HIPAA regulations for health data, and FDA guidelines for wellness technology. AI responses are algorithmically generated and may not always be appropriate. Verify important information with qualified professionals.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-800">
          {!scrolledToBottom && (
            <p className="text-xs text-gray-400 text-center mb-3">Please scroll to read all terms</p>
          )}
          <Button onClick={accept} loading={accepting} disabled={!scrolledToBottom} className="w-full" size="lg">
            <CheckCircle className="w-5 h-5 mr-2" /> I Understand — Continue
          </Button>
          <p className="text-xs text-gray-400 text-center mt-3">
            By continuing, you agree to these terms. You can withdraw consent at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
