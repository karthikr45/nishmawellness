"use client";

import { useState, useEffect } from "react";
import { Phone, MessageSquare, X, AlertTriangle, Heart, ExternalLink, Globe } from "lucide-react";

type Region = "US" | "IN";

const HELPLINES = {
  US: [
    { name: "988 Suicide & Crisis Lifeline", number: "988", desc: "Call or text 988", color: "bg-red-50 hover:bg-red-100", iconColor: "bg-red-600", hoverColor: "group-hover:text-red-600", href: "tel:988" },
    { name: "Crisis Text Line", number: "741741", desc: "Text HOME to 741741", color: "bg-blue-50 hover:bg-blue-100", iconColor: "bg-blue-600", hoverColor: "group-hover:text-blue-600", href: "sms:741741&body=HELLO", icon: "message" },
    { name: "Emergency Services", number: "911", desc: "Call 911", color: "bg-orange-50 hover:bg-orange-100", iconColor: "bg-orange-600", hoverColor: "group-hover:text-orange-600", href: "tel:911" },
    { name: "SAMHSA Helpline", number: "1-800-273-8255", desc: "Substance Abuse", color: "bg-green-50 hover:bg-green-100", iconColor: "bg-green-600", hoverColor: "group-hover:text-green-600", href: "tel:18002738255" },
    { name: "National Domestic Violence", number: "1-800-799-7233", desc: "24/7 Support", color: "bg-purple-50 hover:bg-purple-100", iconColor: "bg-purple-600", hoverColor: "group-hover:text-purple-600", href: "tel:18007997233" },
  ],
  IN: [
    { name: "iCall (TISS)", number: "9152987821", desc: "Mon-Sat, 8am-10pm", color: "bg-red-50 hover:bg-red-100", iconColor: "bg-red-600", hoverColor: "group-hover:text-red-600", href: "tel:9152987821" },
    { name: "Vandrevala Foundation", number: "1860-2662-345", desc: "24/7 Multilingual", color: "bg-blue-50 hover:bg-blue-100", iconColor: "bg-blue-600", hoverColor: "group-hover:text-blue-600", href: "tel:18602662345" },
    { name: "NIMHANS Helpline", number: "080-46110007", desc: "Mon-Sat, 9:30am-5pm", color: "bg-green-50 hover:bg-green-100", iconColor: "bg-green-600", hoverColor: "group-hover:text-green-600", href: "tel:08046110007" },
    { name: "AASRA", number: "9820466726", desc: "24/7 Crisis Support", color: "bg-orange-50 hover:bg-orange-100", iconColor: "bg-orange-600", hoverColor: "group-hover:text-orange-600", href: "tel:9820466726" },
    { name: "Women Helpline (India)", number: "181", desc: "24/7 Women Safety", color: "bg-purple-50 hover:bg-purple-100", iconColor: "bg-purple-600", hoverColor: "group-hover:text-purple-600", href: "tel:181" },
    { name: "Emergency (India)", number: "112", desc: "Police/Ambulance/Fire", color: "bg-red-50 hover:bg-red-100", iconColor: "bg-red-600", hoverColor: "group-hover:text-red-600", href: "tel:112" },
  ],
};

export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [region, setRegion] = useState<Region>("US");

  useEffect(() => {
    const saved = localStorage.getItem("nishma-region") as Region | null;
    if (saved) setRegion(saved);
    else {
      // Auto-detect by timezone
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.startsWith("Asia/Kolkata") || tz.startsWith("Asia/Calcutta") || tz.startsWith("Asia/")) {
        setRegion("IN");
      }
    }
  }, []);

  const switchRegion = (r: Region) => {
    setRegion(r);
    localStorage.setItem("nishma-region", r);
  };

  const helplines = HELPLINES[region];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg shadow-red-200 flex items-center justify-center transition-all hover:scale-110"
        aria-label="Emergency Help"
      >
        <AlertTriangle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full sm:max-w-md mx-4 mb-4 sm:mb-0 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-red-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Heart className="w-6 h-6" />
                  <h2 className="text-xl font-bold">You&apos;re Not Alone</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => switchRegion(region === "US" ? "IN" : "US")}
                    className="flex items-center space-x-1 px-2 py-1 bg-red-500 rounded-lg text-xs hover:bg-red-400">
                    <Globe className="w-3 h-3" />
                    <span>{region === "US" ? "🇺🇸 US" : "🇮🇳 India"}</span>
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-red-500 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-red-100 text-sm mt-2">
                {region === "US" ? "If you're in immediate danger, call 911." : "If you're in immediate danger, call 112."}
                {" "}These resources are available 24/7.
              </p>
            </div>

            <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
              {helplines.map((line) => (
                <a key={line.number} href={line.href}
                  className={`flex items-center justify-between p-4 ${line.color} rounded-xl transition-colors group`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${line.iconColor} rounded-full flex items-center justify-center text-white`}>
                      {"icon" in line && line.icon === "message" ? <MessageSquare className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{line.name}</p>
                      <p className="text-sm text-gray-500">{line.desc}</p>
                    </div>
                  </div>
                  <ExternalLink className={`w-4 h-4 text-gray-400 ${line.hoverColor}`} />
                </a>
              ))}
            </div>

            <div className="px-6 pb-6">
              <p className="text-xs text-gray-400 text-center">
                {region === "IN" ? "आप अकेले नहीं हैं। मदद माँगना ताकत की निशानी है।" : "You matter. Reaching out is a sign of strength, not weakness."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
