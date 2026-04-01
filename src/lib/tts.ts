// Text-to-Speech service abstraction
// In production, replace with ElevenLabs, OpenAI TTS, or Google Cloud TTS

export interface TTSOptions {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onBoundary?: (charIndex: number) => void;
}

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.synth = window.speechSynthesis;
    }
  }

  async speak({ text, voice, rate = 0.9, pitch = 1.0, onStart, onEnd, onBoundary }: TTSOptions): Promise<void> {
    if (!this.synth) return;

    // Cancel any current speech
    this.stop();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Find a natural-sounding voice
      const voices = this.synth!.getVoices();
      const preferredVoice = voices.find(
        (v) => v.name.includes(voice || "Samantha") || v.name.includes("Google") || v.name.includes("Natural")
      ) || voices.find((v) => v.lang === "en-US") || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1.0;

      utterance.onstart = () => onStart?.();
      utterance.onend = () => {
        onEnd?.();
        resolve();
      };
      utterance.onboundary = (event) => {
        onBoundary?.(event.charIndex);
      };
      utterance.onerror = () => {
        onEnd?.();
        resolve();
      };

      this.currentUtterance = utterance;
      this.synth!.speak(utterance);
    });
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  get isSpeaking(): boolean {
    return this.synth?.speaking || false;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synth?.getVoices() || [];
  }
}

// Singleton
let ttsInstance: TTSService | null = null;

export function getTTS(): TTSService {
  if (!ttsInstance) {
    ttsInstance = new TTSService();
  }
  return ttsInstance;
}

// For production: ElevenLabs integration stub
export async function elevenLabsTTS(text: string): Promise<ArrayBuffer | null> {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  // Uncomment when ready:
  // const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/VOICE_ID`, {
  //   method: "POST",
  //   headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
  //   body: JSON.stringify({ text, model_id: "eleven_monolingual_v1" }),
  // });
  // return await response.arrayBuffer();

  return null;
}
