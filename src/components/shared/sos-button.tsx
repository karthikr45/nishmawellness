"use client";

import { useState } from "react";
import { Phone, MessageSquare, X, AlertTriangle, Heart, ExternalLink } from "lucide-react";

export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating SOS Button - always visible */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg shadow-red-200 flex items-center justify-center transition-all hover:scale-110"
        aria-label="Emergency Help"
      >
        <AlertTriangle className="w-6 h-6" />
      </button>

      {/* SOS Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full sm:max-w-md mx-4 mb-4 sm:mb-0 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="bg-red-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Heart className="w-6 h-6" />
                  <h2 className="text-xl font-bold">You&apos;re Not Alone</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-red-500 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-red-100 text-sm mt-2">
                If you&apos;re in immediate danger, call 911. These resources are available 24/7.
              </p>
            </div>

            {/* Resources */}
            <div className="p-6 space-y-3">
              <a href="tel:988" className="flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">988 Suicide & Crisis Lifeline</p>
                    <p className="text-sm text-gray-500">Call or text 988</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
              </a>

              <a href="sms:741741&body=HELLO" className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Crisis Text Line</p>
                    <p className="text-sm text-gray-500">Text HOME to 741741</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </a>

              <a href="tel:911" className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Emergency Services</p>
                    <p className="text-sm text-gray-500">Call 911</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
              </a>

              <a href="tel:18002738255" className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">SAMHSA Helpline</p>
                    <p className="text-sm text-gray-500">1-800-273-8255 (Substance Abuse)</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
              </a>

              <a href="tel:18007997233" className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">National Domestic Violence</p>
                    <p className="text-sm text-gray-500">1-800-799-7233</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
              </a>
            </div>

            <div className="px-6 pb-6">
              <p className="text-xs text-gray-400 text-center">
                You matter. Reaching out is a sign of strength, not weakness.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
