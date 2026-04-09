"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
      <div className="text-center px-4">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <img src="/logo.png" alt="Nishma Wellness" className="w-[200px] object-contain" />
        </div>

        <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on your wellness journey.
        </p>

        <div className="flex items-center justify-center space-x-4">
          <Link href="/">
            <Button variant="primary" size="lg">
              <Home className="w-4 h-4 mr-2" /> Go Home
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={() => history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
