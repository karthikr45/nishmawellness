"use client";

import { RefreshCw, Home } from "lucide-react";
import Button from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
      <div className="text-center px-4">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <img src="/logo-square.png" alt="Nishma" className="w-12 h-12 rounded-xl" />
          <span className="text-xl font-bold gradient-text">Nishma Wellness</span>
        </div>

        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">!</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">Something Went Wrong</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          We encountered an unexpected error. Don&apos;t worry, your data is safe.
        </p>

        <div className="flex items-center justify-center space-x-4">
          <Button onClick={reset} variant="primary" size="lg">
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg">
              <Home className="w-4 h-4 mr-2" /> Go Home
            </Button>
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-100 rounded-xl text-left max-w-lg mx-auto">
            <p className="text-xs text-gray-500 font-mono">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
