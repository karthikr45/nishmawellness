"use client";

import { useEffect, useState, useRef } from "react";

interface AvatarTherapistProps {
  isSpeaking: boolean;
  mood: "neutral" | "empathetic" | "encouraging" | "thoughtful" | "greeting";
  name?: string;
}

export default function AvatarTherapist({ isSpeaking, mood, name = "Dr. Nishma" }: AvatarTherapistProps) {
  const [blinkState, setBlinkState] = useState(false);
  const [breathePhase, setBreathePhase] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(0);
  const mouthRef = useRef<NodeJS.Timeout | null>(null);

  // Blinking animation
  useEffect(() => {
    const blink = () => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    };
    const interval = setInterval(blink, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Breathing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathePhase((p) => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Lip sync simulation when speaking
  useEffect(() => {
    if (isSpeaking) {
      mouthRef.current = setInterval(() => {
        setMouthOpen(Math.random() * 0.8 + 0.2);
      }, 100);
    } else {
      if (mouthRef.current) clearInterval(mouthRef.current);
      setMouthOpen(0);
    }
    return () => {
      if (mouthRef.current) clearInterval(mouthRef.current);
    };
  }, [isSpeaking]);

  const breatheOffset = Math.sin((breathePhase * Math.PI) / 180) * 2;

  // Mood-based expressions
  const eyebrowOffset = mood === "empathetic" ? -3 : mood === "encouraging" ? -4 : mood === "thoughtful" ? -2 : 0;
  const headTilt = mood === "empathetic" ? 3 : mood === "thoughtful" ? -5 : 0;
  const smileWidth = mood === "encouraging" ? 35 : mood === "greeting" ? 38 : 28;
  const smileCurve = mood === "encouraging" ? 8 : mood === "greeting" ? 10 : mood === "empathetic" ? 4 : 5;

  // Eye gaze - slight movements
  const [gazeX, setGazeX] = useState(0);
  const [gazeY, setGazeY] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setGazeX((Math.random() - 0.5) * 3);
      setGazeY((Math.random() - 0.5) * 2);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Avatar Container */}
      <div className="relative w-64 h-72 md:w-80 md:h-96">
        <svg
          viewBox="0 0 200 260"
          className="w-full h-full"
          style={{ transform: `rotate(${headTilt}deg)` }}
        >
          {/* Background glow */}
          <defs>
            <radialGradient id="avatarGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
            </radialGradient>
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="100%" stopColor="#16213e" />
            </linearGradient>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fdbcb4" />
              <stop offset="100%" stopColor="#f4a896" />
            </linearGradient>
            <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>

          {/* Body / Shoulders */}
          <g transform={`translate(0, ${breatheOffset * 0.5})`}>
            <ellipse cx="100" cy="240" rx="65" ry="30" fill="url(#shirtGrad)" />
            <rect x="35" y="210" width="130" height="30" rx="5" fill="url(#shirtGrad)" />
            {/* Collar */}
            <path d="M 85 210 L 100 225 L 115 210" fill="none" stroke="#15803d" strokeWidth="2" />
          </g>

          {/* Neck */}
          <rect x="90" y="195" width="20" height="20" rx="5" fill="url(#skinGrad)"
            transform={`translate(0, ${breatheOffset * 0.3})`} />

          {/* Head */}
          <g transform={`translate(0, ${breatheOffset})`}>
            {/* Hair back */}
            <ellipse cx="100" cy="110" rx="55" ry="62" fill="url(#hairGrad)" />

            {/* Face */}
            <ellipse cx="100" cy="120" rx="48" ry="55" fill="url(#skinGrad)" />

            {/* Hair front */}
            <path d="M 52 105 Q 60 65 100 60 Q 140 65 148 105 Q 145 85 125 78 Q 100 72 75 78 Q 55 85 52 105"
              fill="url(#hairGrad)" />

            {/* Ears */}
            <ellipse cx="52" cy="125" rx="8" ry="12" fill="#f4a896" />
            <ellipse cx="148" cy="125" rx="8" ry="12" fill="#f4a896" />

            {/* Eyebrows */}
            <g transform={`translate(0, ${eyebrowOffset})`}>
              <path d={`M 72 ${105 + (mood === "empathetic" ? 2 : 0)} Q 80 ${100 + (mood === "empathetic" ? 0 : -2)} 92 ${103 + (mood === "empathetic" ? 1 : 0)}`}
                fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
              <path d={`M 108 ${103 + (mood === "empathetic" ? 1 : 0)} Q 120 ${100 + (mood === "empathetic" ? 0 : -2)} 128 ${105 + (mood === "empathetic" ? 2 : 0)}`}
                fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Eyes */}
            <g>
              {/* Left eye */}
              <ellipse cx="82" cy="118" rx="10" ry={blinkState ? 1 : 7} fill="white" />
              {!blinkState && (
                <>
                  <circle cx={82 + gazeX} cy={118 + gazeY} r="5" fill="#4a3728" />
                  <circle cx={82 + gazeX} cy={118 + gazeY} r="3" fill="#1a1a2e" />
                  <circle cx={80 + gazeX} cy={116 + gazeY} r="1.5" fill="white" />
                </>
              )}

              {/* Right eye */}
              <ellipse cx="118" cy="118" rx="10" ry={blinkState ? 1 : 7} fill="white" />
              {!blinkState && (
                <>
                  <circle cx={118 + gazeX} cy={118 + gazeY} r="5" fill="#4a3728" />
                  <circle cx={118 + gazeX} cy={118 + gazeY} r="3" fill="#1a1a2e" />
                  <circle cx={116 + gazeX} cy={116 + gazeY} r="1.5" fill="white" />
                </>
              )}
            </g>

            {/* Nose */}
            <path d="M 98 128 Q 100 135 102 128" fill="none" stroke="#e8967a" strokeWidth="1.5" strokeLinecap="round" />

            {/* Mouth */}
            {isSpeaking ? (
              <ellipse cx="100" cy="148" rx={10 + mouthOpen * 5} ry={3 + mouthOpen * 8} fill="#c44040" />
            ) : (
              <path
                d={`M ${100 - smileWidth / 2} 146 Q 100 ${146 + smileCurve} ${100 + smileWidth / 2} 146`}
                fill="none" stroke="#c44040" strokeWidth="2.5" strokeLinecap="round"
              />
            )}

            {/* Cheek blush */}
            {(mood === "encouraging" || mood === "greeting") && (
              <>
                <ellipse cx="68" cy="135" rx="8" ry="5" fill="#ffb3b3" opacity="0.3" />
                <ellipse cx="132" cy="135" rx="8" ry="5" fill="#ffb3b3" opacity="0.3" />
              </>
            )}
          </g>

          {/* Speaking indicator */}
          {isSpeaking && (
            <g>
              {[0, 1, 2].map((i) => (
                <circle
                  key={i}
                  cx={170 + i * 8}
                  cy={80}
                  r={2 + Math.sin(Date.now() / 200 + i) * 1.5}
                  fill="#22c55e"
                  opacity={0.6}
                >
                  <animate
                    attributeName="r"
                    values="2;4;2"
                    dur={`${0.4 + i * 0.1}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </g>
          )}
        </svg>

        {/* Status indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
            isSpeaking
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}>
            <div className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            <span>{isSpeaking ? "Speaking..." : "Listening"}</span>
          </div>
        </div>
      </div>

      {/* Name tag */}
      <div className="mt-2 text-center">
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">AI Wellness Therapist</p>
      </div>
    </div>
  );
}
