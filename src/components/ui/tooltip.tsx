"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  /** Content shown inside the tooltip popup */
  content: React.ReactNode;
  /** What the user hovers over. Defaults to a small ⓘ icon. */
  children?: React.ReactNode;
  /** Where the tooltip should appear relative to the trigger */
  position?: "top" | "bottom" | "left" | "right";
  /** Max width of the tooltip in pixels */
  maxWidth?: number;
}

export default function Tooltip({
  content,
  children,
  position = "top",
  maxWidth = 280,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);

  // Dismiss on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const positionClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses: Record<string, string> = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent",
  };

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex items-center align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      aria-describedby={open ? "tooltip-content" : undefined}
    >
      {children ?? (
        <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help ml-1" />
      )}
      {open && (
        <span
          id="tooltip-content"
          role="tooltip"
          className={`absolute z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl pointer-events-none animate-fade-in-up ${positionClasses[position]}`}
          style={{ width: `${maxWidth}px`, maxWidth: `${maxWidth}px` }}
        >
          {content}
          <span
            aria-hidden
            className={`absolute border-4 ${arrowClasses[position]}`}
          />
        </span>
      )}
    </span>
  );
}
