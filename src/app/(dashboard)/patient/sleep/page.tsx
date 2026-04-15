"use client";

import { useState, useRef, useEffect } from "react";
import { Moon, Play, Pause, Volume2, Clock, Star, Wind, Cloud, Waves, TreePine } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Tooltip from "@/components/ui/tooltip";

interface SoundscapeTrack {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  frequency: number; // Hz for generated sound
  type: "brown" | "white" | "pink" | "binaural";
}

interface SleepStory {
  id: string;
  title: string;
  narrator: string;
  duration: number; // minutes
  category: string;
  description: string;
  script: string[];
}

const SOUNDSCAPES: SoundscapeTrack[] = [
  { id: "rain", name: "Gentle Rain", icon: <Cloud className="w-6 h-6" />, color: "bg-blue-100 text-blue-600", frequency: 200, type: "brown" },
  { id: "ocean", name: "Ocean Waves", icon: <Waves className="w-6 h-6" />, color: "bg-cyan-100 text-cyan-600", frequency: 150, type: "pink" },
  { id: "wind", name: "Forest Wind", icon: <Wind className="w-6 h-6" />, color: "bg-green-100 text-green-600", frequency: 300, type: "white" },
  { id: "night", name: "Night Crickets", icon: <Moon className="w-6 h-6" />, color: "bg-indigo-100 text-indigo-600", frequency: 400, type: "brown" },
  { id: "fire", name: "Campfire", icon: <TreePine className="w-6 h-6" />, color: "bg-orange-100 text-orange-600", frequency: 180, type: "brown" },
  { id: "binaural", name: "Deep Sleep (Binaural)", icon: <Star className="w-6 h-6" />, color: "bg-purple-100 text-purple-600", frequency: 100, type: "binaural" },
];

const SLEEP_STORIES: SleepStory[] = [
  {
    id: "1", title: "The Quiet Forest", narrator: "Dr. Sarah Johnson", duration: 15, category: "Nature",
    description: "A gentle journey through a peaceful, ancient forest as evening settles in.",
    script: [
      "Close your eyes and take a deep, slow breath. Let your body settle into the bed, feeling the weight of the day begin to dissolve...",
      "Imagine you're standing at the edge of a quiet forest. The sun is just beginning to set, painting the sky in soft shades of amber and violet...",
      "You step onto a soft moss-covered path. Each step feels cushioned, like walking on clouds. The air is cool and fresh, carrying the scent of pine and earth...",
      "Birds are settling into their nests for the night, their songs becoming softer, gentler — a lullaby from nature itself...",
      "You find a clearing where the last golden rays of sunlight filter through the canopy. A soft breeze rustles the leaves above, creating the most peaceful sound...",
      "Your eyelids grow heavier with each breath. The forest cradles you in its ancient calm. There is nothing to do, nowhere to go. Just this perfect, peaceful moment...",
    ],
  },
  {
    id: "2", title: "Stargazing on the Meadow", narrator: "Dr. Michael Chen", duration: 12, category: "Night Sky",
    description: "Lie on a blanket in a meadow and watch the stars appear one by one.",
    script: [
      "Take a slow, deep breath. Feel your body become heavier, sinking into comfort...",
      "You're lying on a soft blanket in a wide, open meadow. The grass around you is tall enough to create a gentle cocoon...",
      "The sky above is enormous — a deep, deep blue that's slowly turning to the darkest velvet. The first star appears, twinkling softly just for you...",
      "One by one, more stars emerge. Each one a tiny light in the vast peaceful darkness. Your breathing becomes slower, deeper...",
      "The Milky Way stretches across the sky like a river of light. You feel wonderfully small and perfectly safe in this beautiful universe...",
      "Your eyes close naturally. The stars continue their ancient dance above you, and you drift into the most peaceful sleep...",
    ],
  },
  {
    id: "3", title: "The Cozy Cabin", narrator: "Dr. Emily Rivera", duration: 18, category: "Comfort",
    description: "Find warmth and peace in a mountain cabin during a gentle snowfall.",
    script: [
      "Settle in. Let your shoulders drop. Release any tension in your jaw. This is your time to simply rest...",
      "You're in a small, cozy cabin nestled in the mountains. Outside, soft snowflakes drift down in the moonlight...",
      "A fire crackles gently in the stone fireplace. The warmth wraps around you like a blanket. You're sitting in the most comfortable armchair imaginable...",
      "Through the window, the world is hushed under a blanket of fresh snow. Everything is still, everything is quiet, everything is at peace...",
      "You hold a warm cup of tea. The steam rises gently, carrying the scent of chamomile. Each sip sends warmth through your whole body...",
      "The crackle of the fire, the whisper of snow, the warmth of the cabin — all conspiring to carry you into the deepest, most restful sleep...",
    ],
  },
];

export default function SleepStoriesPage() {
  const [activeTab, setActiveTab] = useState<"stories" | "sounds">("stories");
  const [playingStory, setPlayingStory] = useState<SleepStory | null>(null);
  const [storyStep, setStoryStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSounds, setActiveSounds] = useState<Set<string>>(new Set());
  const [volume, setVolume] = useState(50);
  const [sleepTimer, setSleepTimer] = useState(0); // minutes
  const [timerActive, setTimerActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Map<string, { gain: GainNode; source: AudioBufferSourceNode | OscillatorNode }>>(new Map());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const storyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      nodesRef.current.forEach((node) => { try { node.source.stop(); } catch {} });
      audioCtxRef.current?.close();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    };
  }, []);

  const toggleSound = (track: SoundscapeTrack) => {
    if (activeSounds.has(track.id)) {
      // Stop
      const node = nodesRef.current.get(track.id);
      if (node) { try { node.source.stop(); } catch {} nodesRef.current.delete(track.id); }
      setActiveSounds((prev) => { const n = new Set(prev); n.delete(track.id); return n; });
    } else {
      // Start
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const gain = ctx.createGain();
      gain.gain.value = volume / 100 * 0.3;
      gain.connect(ctx.destination);

      // Generate noise
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
        // Brown noise filter
        if (track.type === "brown" && i > 0) data[i] = data[i - 1] + data[i] * 0.02;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start();

      nodesRef.current.set(track.id, { gain, source });
      setActiveSounds((prev) => new Set([...prev, track.id]));
    }
  };

  const updateVolume = (v: number) => {
    setVolume(v);
    nodesRef.current.forEach((node) => { node.gain.gain.value = v / 100 * 0.3; });
  };

  const startSleepTimer = (minutes: number) => {
    setSleepTimer(minutes);
    setTimerActive(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // Stop all sounds
      nodesRef.current.forEach((node) => { try { node.source.stop(); } catch {} });
      nodesRef.current.clear();
      setActiveSounds(new Set());
      setTimerActive(false);
      setPlayingStory(null);
      setIsPlaying(false);
    }, minutes * 60 * 1000);
  };

  const playStory = (story: SleepStory) => {
    setPlayingStory(story);
    setStoryStep(0);
    setIsPlaying(true);

    // Auto-advance story steps
    const advanceStep = (step: number) => {
      if (step >= story.script.length - 1) {
        setIsPlaying(false);
        return;
      }
      storyTimerRef.current = setTimeout(() => {
        setStoryStep(step + 1);
        // Speak the text
        if (typeof window !== "undefined" && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(story.script[step + 1]);
          utterance.rate = 0.8;
          utterance.pitch = 0.9;
          utterance.volume = volume / 100;
          utterance.onend = () => advanceStep(step + 1);
          window.speechSynthesis.speak(utterance);
        } else {
          advanceStep(step + 1);
        }
      }, 8000);
    };

    // Speak first step
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(story.script[0]);
      utterance.rate = 0.8;
      utterance.pitch = 0.9;
      utterance.volume = volume / 100;
      utterance.onend = () => advanceStep(0);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopStory = () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    setIsPlaying(false);
    setPlayingStory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sleep & Relaxation</h1>
          <p className="text-gray-500 mt-1">Sleep stories, ambient sounds, and relaxation tools</p>
        </div>
        <div className="flex items-center space-x-3">
          {timerActive && (
            <Badge variant="info">{sleepTimer} min timer active</Badge>
          )}
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <input type="range" min="0" max="100" value={volume} onChange={(e) => updateVolume(parseInt(e.target.value))}
              className="w-20" />
          </div>
        </div>
      </div>

      {/* How to use — auto-adapts to active tab */}
      <Card className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          {activeTab === "stories" ? "When to use Sleep Stories" : "When to use Soundscapes"}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {activeTab === "stories" ? (
            <>
              Best for bedtime. Get into bed, dim the lights, put your phone on silent, and let the narrator guide you through a calming scene.
              The voice and imagery gradually slow your thoughts so you drift off naturally. Pick one story — do not browse.
            </>
          ) : (
            <>
              Best for focus, relaxation, or masking distracting noise. Play a soundscape in the background while you work, meditate, or sleep.
              You can play multiple at once — try Rain + Campfire for a cosy atmosphere. Use the sleep timer to auto-stop after you drift off.
            </>
          )}
        </p>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl max-w-sm">
        <button onClick={() => setActiveTab("stories")}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium ${activeTab === "stories" ? "bg-white dark:bg-gray-700 shadow-sm text-primary-700" : "text-gray-500"}`}>
          Sleep Stories
        </button>
        <button onClick={() => setActiveTab("sounds")}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium ${activeTab === "sounds" ? "bg-white dark:bg-gray-700 shadow-sm text-primary-700" : "text-gray-500"}`}>
          Soundscapes
        </button>
      </div>

      {/* Sleep Timer */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <Clock className="w-4 h-4 mr-2" /> Sleep Timer
          </span>
          <div className="flex space-x-2">
            {[15, 30, 45, 60].map((min) => (
              <button key={min} onClick={() => startSleepTimer(min)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sleepTimer === min && timerActive ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {min}m
              </button>
            ))}
            {timerActive && (
              <button onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); setTimerActive(false); }}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-600">Cancel</button>
            )}
          </div>
        </div>
      </Card>

      {/* Stories Tab */}
      {activeTab === "stories" && (
        <div className="space-y-4">
          {playingStory && (
            <Card className="p-6 bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-indigo-200">Now Playing</p>
                  <h3 className="text-lg font-bold">{playingStory.title}</h3>
                  <p className="text-sm text-indigo-300">Narrated by {playingStory.narrator}</p>
                </div>
                <button onClick={stopStory} className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
                  <Pause className="w-6 h-6" />
                </button>
              </div>
              <p className="text-indigo-100 leading-relaxed italic">&ldquo;{playingStory.script[storyStep]}&rdquo;</p>
              <div className="mt-4 flex items-center space-x-2">
                {playingStory.script.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i <= storyStep ? "bg-white" : "bg-white/20"}`} />
                ))}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SLEEP_STORIES.map((story) => (
              <Card key={story.id} hover className="overflow-hidden cursor-pointer" onClick={() => playStory(story)}>
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <div className="p-5">
                  <Badge variant="default">{story.category}</Badge>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2">{story.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{story.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> {story.duration} min</span>
                    <Button size="sm"><Play className="w-4 h-4 mr-1" /> Play</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Soundscapes Tab */}
      {activeTab === "sounds" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SOUNDSCAPES.map((track) => {
              const isActive = activeSounds.has(track.id);
              const noiseHint: Record<string, string> = {
                brown: "Brown noise — deep, rumbly. Great for blocking low-frequency noise and sleep.",
                pink: "Pink noise — balanced and gentle. Often used to improve deep sleep quality.",
                white: "White noise — high-pitched hiss. Best for masking sudden sharp sounds like chatter.",
                binaural: "Binaural beats — two slightly different tones played in each ear. Research suggests they may help the brain enter relaxed states. Requires headphones.",
              };
              return (
                <div key={track.id} className="relative">
                  <Card hover
                    className={`p-6 text-center cursor-pointer transition-all ${isActive ? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-950" : ""}`}
                    onClick={() => toggleSound(track)}>
                    <div className={`w-16 h-16 ${track.color} rounded-2xl flex items-center justify-center mx-auto mb-3 ${isActive ? "animate-pulse" : ""}`}>
                      {track.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center justify-center">
                      {track.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 capitalize">
                      {isActive ? "Playing" : `${track.type} noise`}
                    </p>
                    {isActive && (
                      <div className="flex items-center justify-center space-x-0.5 mt-3 h-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="w-1 bg-primary-500 rounded-full animate-bounce"
                            style={{ height: `${8 + Math.random() * 10}px`, animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                    )}
                  </Card>
                  {/* Info tooltip pinned to top-right corner so it doesn't block card click */}
                  <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                    <Tooltip content={noiseHint[track.type]} position="left" maxWidth={260} />
                  </div>
                </div>
              );
            })}
          </div>

          <Card className="p-5 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Tip:</strong> Combine sounds. Rain + Campfire is a classic. Use headphones for Deep Sleep (Binaural).
              Set a sleep timer so audio auto-stops after you drift off.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
