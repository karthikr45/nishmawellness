"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, Square } from "lucide-react";

interface VoiceControlsProps {
  onSpeechResult: (text: string) => void;
  onSpeakText: (text: string) => Promise<void>;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
}

export default function VoiceControls({
  onSpeechResult,
  isSpeaking,
  onStopSpeaking,
}: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const startListening = async () => {
    // Check browser support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const text = prompt("Speech recognition not supported in this browser. Type your message:");
      if (text) onSpeechResult(text);
      return;
    }

    try {
      // Get microphone access for visualization
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const updateLevel = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        setAudioLevel(avg / 255);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // Speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(interimTranscript || finalTranscript);

        if (finalTranscript) {
          onSpeechResult(finalTranscript.trim());
          setTranscript("");
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        stopListening();
      };

      recognition.onend = () => {
        // Auto-restart if still listening
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {
            // Already started
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      // Fallback to text input
      const text = prompt("Microphone access denied. Type your message:");
      if (text) onSpeechResult(text);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsListening(false);
    setAudioLevel(0);
    setTranscript("");
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Live transcript */}
      {transcript && (
        <div className="px-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-600 italic max-w-md text-center animate-pulse">
          {transcript}...
        </div>
      )}

      {/* Audio waveform visualization */}
      {isListening && (
        <div className="flex items-center justify-center space-x-1 h-8">
          {Array.from({ length: 20 }).map((_, i) => {
            const height = 4 + audioLevel * 24 * Math.sin((i / 20) * Math.PI) * (0.5 + Math.random() * 0.5);
            return (
              <div
                key={i}
                className="w-1 rounded-full bg-primary-500 transition-all duration-75"
                style={{ height: `${Math.max(4, height)}px` }}
              />
            );
          })}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center space-x-4">
        {/* Mute/unmute output */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isMuted
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Main mic button */}
        {isSpeaking ? (
          <button
            onClick={onStopSpeaking}
            className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-200"
          >
            <Square className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isListening
                ? "bg-red-500 text-white hover:bg-red-600 shadow-red-200 animate-pulse"
                : "gradient-bg text-white hover:opacity-90 shadow-primary-200"
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        )}

        {/* Spacer for symmetry */}
        <div className="w-12 h-12" />
      </div>

      <p className="text-xs text-gray-400">
        {isSpeaking
          ? "AI is speaking... tap to interrupt"
          : isListening
          ? "Listening... speak now"
          : "Tap the microphone to start speaking"}
      </p>
    </div>
  );
}
