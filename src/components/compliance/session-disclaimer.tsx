"use client";

import { Shield, Phone } from "lucide-react";

export default function SessionDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center justify-center space-x-2 py-2 px-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-xs text-yellow-700 dark:text-yellow-300">
        <Shield className="w-3 h-3 flex-shrink-0" />
        <span>AI wellness support — not a licensed therapist. Emergencies: call 988 or 911.</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl">
      <div className="flex items-start space-x-3">
        <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">AI Wellness Assistant</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
            This is an AI assistant, not a licensed therapist. It cannot diagnose conditions or prescribe treatment.
            Responses are for wellness support only.
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <a href="tel:988" className="flex items-center text-xs text-yellow-700 dark:text-yellow-300 hover:underline">
              <Phone className="w-3 h-3 mr-1" /> Crisis: 988
            </a>
            <a href="tel:911" className="flex items-center text-xs text-yellow-700 dark:text-yellow-300 hover:underline">
              <Phone className="w-3 h-3 mr-1" /> Emergency: 911
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
