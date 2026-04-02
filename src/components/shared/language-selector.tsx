"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { LOCALES, setLocale, getLocale, type Locale } from "@/lib/i18n";

export default function LanguageSelector() {
  const [current, setCurrent] = useState<Locale>("en");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCurrent(getLocale());
  }, []);

  const change = (locale: Locale) => {
    setCurrent(locale);
    setLocale(locale);
    setOpen(false);
    window.location.reload(); // Refresh to apply translations
  };

  const currentLocale = LOCALES.find((l) => l.code === current);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
        <Globe className="w-4 h-4" />
        <span>{currentLocale?.flag} {currentLocale?.name}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 py-2 z-50 max-h-64 overflow-y-auto">
            {LOCALES.map((locale) => (
              <button key={locale.code} onClick={() => change(locale.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 ${
                  current === locale.code ? "text-primary-600 font-medium" : "text-gray-600 dark:text-gray-300"
                }`}>
                <span>{locale.flag}</span>
                <span>{locale.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
