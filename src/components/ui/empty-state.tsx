import React from "react";

interface EmptyStateProps {
  /** Icon to render at top — pass a lucide icon element with desired sizing */
  icon: React.ReactNode;
  /** Bold heading line */
  title: string;
  /** Optional explanatory paragraph */
  description?: string;
  /** Optional CTA element (Link/Button) */
  action?: React.ReactNode;
  /** Smaller variant for use inside cards/sections */
  compact?: boolean;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`text-center ${compact ? "py-8" : "py-14"}`}>
      <div className={`mx-auto mb-3 text-gray-300 dark:text-gray-600 flex items-center justify-center ${compact ? "" : "scale-110"}`}>
        {icon}
      </div>
      <p className="font-semibold text-gray-700 dark:text-gray-200">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
