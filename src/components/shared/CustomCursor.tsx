"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor with a precise inner dot and a trailing outer ring.
 * - Dot follows the mouse instantly (position: fixed, transform)
 * - Ring lerps toward the mouse each frame for a soft trailing effect
 * - Grows on interactive elements, shrinks on click
 * - Disabled on touch / no-hover devices
 * - Hides when leaving the window
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch-only devices.
    if (typeof window === "undefined") return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    // Add a global style once — hide native cursor everywhere,
    // including on interactive elements.
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-custom-cursor", "true");
    styleEl.innerHTML = `
      html, body, * { cursor: none !important; }
      /* Keep native cursor for text inputs, textareas, contenteditable — feels wrong without a caret indicator */
      input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]),
      textarea,
      [contenteditable="true"] {
        cursor: text !important;
      }
    `;
    document.head.appendChild(styleEl);

    const dot = dotRef.current!;
    const ring = ringRef.current!;

    // Real mouse position (instant target for dot & lerp target for ring).
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    // Ring's rendered position (lerps toward mouse each frame).
    const ringPos = { x: mouse.x, y: mouse.y };
    // Scale state — updated by hover / press handlers, animated via transform.
    let ringScale = 1;
    let dotScale = 1;
    let visible = false;
    let rafId = 0;

    const setInitial = () => {
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%) scale(1)`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(1)`;
    };
    setInitial();

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    };

    const onMouseLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const onMouseEnter = () => {
      visible = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    const isInteractive = (el: EventTarget | null): boolean => {
      if (!(el instanceof Element)) return false;
      return !!el.closest(
        'a, button, [role="button"], [role="tab"], [role="menuitem"], [role="link"], input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], select, summary, label, [data-cursor="hover"]'
      );
    };

    const onOver = (e: MouseEvent) => {
      if (isInteractive(e.target)) {
        ringScale = 1.6;
        dotScale = 0;
      } else {
        ringScale = 1;
        dotScale = 1;
      }
    };

    const onDown = () => { ringScale = 0.7; };
    const onUp = (e: MouseEvent) => { ringScale = isInteractive(e.target) ? 1.6 : 1; };

    // Smooth the ring toward the mouse each frame.
    // renderedScale eases toward the target scale so hover / press feels soft.
    let renderedRingScale = 1;
    let renderedDotScale = 1;
    const RING_LERP = 0.18;   // higher = snappier
    const SCALE_LERP = 0.2;

    const tick = () => {
      // Lerp ring position.
      ringPos.x += (mouse.x - ringPos.x) * RING_LERP;
      ringPos.y += (mouse.y - ringPos.y) * RING_LERP;
      renderedRingScale += (ringScale - renderedRingScale) * SCALE_LERP;
      renderedDotScale += (dotScale - renderedDotScale) * SCALE_LERP;

      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%) scale(${renderedDotScale})`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${renderedRingScale})`;

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      styleEl.remove();
    };
  }, []);

  return (
    <>
      {/* Outer trailing ring */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "1.5px solid #6690f5",
          pointerEvents: "none",
          zIndex: 2147483647,
          opacity: 0,
          transition: "opacity 200ms ease, border-color 200ms ease",
          willChange: "transform, opacity",
          mixBlendMode: "normal",
        }}
      />
      {/* Inner precise dot */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#6690f5",
          pointerEvents: "none",
          zIndex: 2147483647,
          opacity: 0,
          transition: "opacity 200ms ease, background-color 200ms ease",
          willChange: "transform, opacity",
        }}
      />
    </>
  );
}
