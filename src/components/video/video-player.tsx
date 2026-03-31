"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, RotateCcw,
} from "lucide-react";

interface VideoPlayerProps {
  title: string;
  description?: string;
  duration?: number; // seconds
  onComplete?: () => void;
  poster?: string;
}

export default function VideoPlayer({
  title,
  description,
  duration = 600,
  onComplete,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + playbackSpeed;
          if (next >= duration) {
            setIsPlaying(false);
            onComplete?.();
            return duration;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, playbackSpeed, onComplete]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    setCurrentTime(Math.floor(pct * duration));
  };

  const skip = (seconds: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(duration, prev + seconds)));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  // Generate visual waveform/scene data for the simulated video
  const scenes = [
    { time: 0, label: "Introduction", color: "from-blue-600 to-blue-400" },
    { time: duration * 0.2, label: "Core Concepts", color: "from-purple-600 to-purple-400" },
    { time: duration * 0.5, label: "Guided Practice", color: "from-green-600 to-green-400" },
    { time: duration * 0.75, label: "Integration", color: "from-orange-600 to-orange-400" },
    { time: duration * 0.9, label: "Summary", color: "from-pink-600 to-pink-400" },
  ];

  const currentScene = scenes.reduce((acc, scene) => (currentTime >= scene.time ? scene : acc), scenes[0]);

  return (
    <div
      ref={containerRef}
      className="relative bg-gray-900 rounded-2xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Display Area */}
      <div className="aspect-video flex items-center justify-center relative cursor-pointer" onClick={togglePlay}>
        {/* Animated background representing video content */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentScene.color} opacity-20 transition-all duration-1000`} />

        {/* Animated wave visualization */}
        <div className="absolute bottom-20 left-0 right-0 flex items-end justify-center space-x-1 px-8">
          {Array.from({ length: 40 }).map((_, i) => {
            const height = isPlaying
              ? 20 + Math.sin((currentTime * 2 + i * 0.3)) * 15 + Math.random() * 10
              : 5;
            return (
              <div
                key={i}
                className="w-1.5 rounded-full bg-white/30 transition-all duration-150"
                style={{ height: `${height}px` }}
              />
            );
          })}
        </div>

        {/* Center content */}
        <div className="relative z-10 text-center">
          {!isPlaying && currentTime === 0 && (
            <div>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-white/30 transition-colors">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
              <h3 className="text-white text-xl font-semibold">{title}</h3>
              {description && <p className="text-white/60 text-sm mt-2 max-w-md">{description}</p>}
            </div>
          )}
          {!isPlaying && currentTime > 0 && currentTime < duration && (
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <Play className="w-7 h-7 text-white ml-1" />
            </div>
          )}
          {isPlaying && (
            <div className="text-white/60">
              <p className="text-lg font-medium text-white">{currentScene.label}</p>
              <p className="text-sm mt-1">{title}</p>
            </div>
          )}
          {currentTime >= duration && (
            <div>
              <div className="w-20 h-20 bg-green-500/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white text-lg font-semibold">Lesson Complete!</h3>
              <button onClick={(e) => { e.stopPropagation(); setCurrentTime(0); }} className="text-white/60 text-sm mt-2 hover:text-white">
                Watch Again
              </button>
            </div>
          )}
        </div>

        {/* Chapter markers */}
        <div className="absolute top-4 right-4 text-right">
          <span className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
            {currentScene.label}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-10 pb-3 px-4 transition-opacity duration-300 ${
        showControls || !isPlaying ? "opacity-100" : "opacity-0"
      }`}>
        {/* Progress bar */}
        <div className="mb-3 cursor-pointer group/progress" onClick={seek}>
          <div className="w-full h-1.5 bg-white/20 rounded-full group-hover/progress:h-2.5 transition-all relative">
            <div className="absolute inset-y-0 left-0 bg-primary-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-all"
              style={{ left: `${progress}%`, marginLeft: "-7px" }} />
            {/* Chapter markers on progress bar */}
            {scenes.map((scene, i) => (
              <div key={i} className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-white/40 rounded-full"
                style={{ left: `${(scene.time / duration) * 100}%` }} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-white hover:text-primary-400 transition-colors">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); skip(-10); }} className="text-white/70 hover:text-white transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); skip(10); }} className="text-white/70 hover:text-white transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>

            <span className="text-white/70 text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Volume */}
            <div className="flex items-center space-x-1 group/vol">
              <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="text-white/70 hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-200">
                <input type="range" min="0" max="100" value={isMuted ? 0 : volume}
                  onChange={(e) => { setVolume(parseInt(e.target.value)); setIsMuted(false); }}
                  className="w-20 h-1 appearance-none bg-white/30 rounded-full cursor-pointer"
                  onClick={(e) => e.stopPropagation()} />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Playback speed */}
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                className="text-white/70 hover:text-white text-xs flex items-center">
                <Settings className="w-4 h-4 mr-1" /> {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-8 right-0 bg-gray-800 rounded-lg py-1 shadow-lg">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button key={speed}
                      onClick={(e) => { e.stopPropagation(); setPlaybackSpeed(speed); setShowSpeedMenu(false); }}
                      className={`block w-full text-left px-4 py-1.5 text-xs ${
                        playbackSpeed === speed ? "text-primary-400 font-medium" : "text-white/70 hover:text-white"
                      }`}>
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-white/70 hover:text-white">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
