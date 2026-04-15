import React from "react";

interface SkeletonProps {
  className?: string;
  /** Multiple-line text skeleton: number of bars to render */
  lines?: number;
  /** Variant: bar (default), circle (avatar), card (with padding) */
  variant?: "bar" | "circle" | "card";
}

/**
 * Lightweight loading skeleton. Uses Tailwind's animate-pulse.
 * Use instead of spinners for content that takes >300ms to load.
 */
export default function Skeleton({ className = "", lines = 1, variant = "bar" }: SkeletonProps) {
  if (variant === "circle") {
    return (
      <div className={`animate-pulse rounded-full bg-gray-200 dark:bg-gray-800 ${className}`} />
    );
  }

  if (variant === "card") {
    return (
      <div className={`animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800/50 p-6 space-y-3 ${className}`}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      </div>
    );
  }

  if (lines === 1) {
    return (
      <div className={`animate-pulse h-4 bg-gray-200 dark:bg-gray-800 rounded ${className}`} />
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse h-4 bg-gray-200 dark:bg-gray-800 rounded"
          style={{ width: `${100 - i * 8}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Pre-composed skeleton for the patient dashboard layout.
 * Mirrors the actual content shape so the layout doesn't jump.
 */
export function PatientDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="animate-pulse rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 h-48" />
      {/* Suggested Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="card" className="h-20" />
        ))}
      </div>
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="card" className="h-32" />
        ))}
      </div>
      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton variant="card" className="lg:col-span-2 h-72" />
        <div className="space-y-6">
          <Skeleton variant="card" className="h-40" />
          <Skeleton variant="card" className="h-40" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for a list-of-rows layout (appointments, patients, etc.)
 */
export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
