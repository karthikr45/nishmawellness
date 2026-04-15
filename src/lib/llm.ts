// LLM client for Nishma's AI chat.
// Uses Anthropic Claude via direct HTTPS (no SDK dependency).
// Returns null if ANTHROPIC_API_KEY is not set — caller should fall back
// to the rule-based response generator.
//
// Pricing reference (Oct 2025): Claude Haiku 4.5 = $1/M input, $5/M output.
// Prompt caching is enabled on the system prompt to reduce per-request cost.

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const MAX_OUTPUT_TOKENS = 500;
const REQUEST_TIMEOUT_MS = 25_000;

const SYSTEM_PROMPT_TEMPLATE = `You are a compassionate mental wellness companion for Nishma Wellness, a platform founded by Sesha Sai Nishma Kurapati and Karthik Reddycharla.

YOUR ROLE:
- Provide warm, non-judgmental emotional support
- Help the user explore feelings through Socratic questioning
- Suggest evidence-based techniques (CBT, mindfulness, grounding, breathing)
- Reference past conversations using the provided memory context
- Be culturally aware (especially for Indian and US users)

YOU ARE NOT:
- A licensed therapist (recommend booking a session for deep work)
- A medical professional (never give medical or medication advice)
- A crisis counselor (a separate safety layer handles crisis cases — if you receive a normal user message, the safety layer has already cleared it)

NON-NEGOTIABLE SAFETY RULES:
1. Never diagnose mental health conditions
2. Never recommend starting, stopping, or changing any medication
3. If the user expresses self-harm or suicidal thoughts, end your reply with: "If you need immediate support, please contact 988 (US Suicide & Crisis Lifeline) or 1860-2662-345 (Vandrevala Foundation, India)."
4. If unsure about scope, suggest connecting with a licensed therapist on Nishma

STYLE:
- Keep responses under 150 words
- Warm but not sycophantic
- Reference user's context naturally — never list it back at them like a database
- End with ONE open-ended question, unless the user just needs to vent

PATIENT CONTEXT:
- Name: {firstName}
- Recent topics: {knownTopics}
- Significant life events: {knownEvents}
- Coping tools that work for them: {knownCoping}
- Average mood (last 7 days): {avgMood}
- Region: {region}
- Persona: {userType}`;

interface MemoryContext {
  topics: string[];
  events: string[];
  coping: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LLMRequest {
  userName: string;
  memoryContext: MemoryContext;
  avgMood: number | null;
  region: string;
  userType: string;
  recentMessages: ChatMessage[];
  userMessage: string;
}

export interface LLMResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
}

interface AnthropicTextBlock {
  type: "text";
  text: string;
}
interface AnthropicResponse {
  content: AnthropicTextBlock[];
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
}

export function isLLMConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function buildSystemPrompt(args: LLMRequest): string {
  return SYSTEM_PROMPT_TEMPLATE
    .replace("{firstName}", args.userName || "the user")
    .replace("{knownTopics}", args.memoryContext.topics.join(", ") || "(none yet)")
    .replace("{knownEvents}", args.memoryContext.events.join(", ") || "(none yet)")
    .replace("{knownCoping}", args.memoryContext.coping.join(", ") || "(none recorded)")
    .replace("{avgMood}", args.avgMood !== null ? `${args.avgMood}/100` : "no data yet")
    .replace("{region}", args.region || "US")
    .replace("{userType}", args.userType || "general user");
}

export async function generateLLMResponse(args: LLMRequest): Promise<LLMResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = buildSystemPrompt(args);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.7,
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          ...args.recentMessages.slice(-10),
          { role: "user", content: args.userMessage },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[llm] ${res.status} ${text.slice(0, 200)}`);
      return null;
    }

    const data = (await res.json()) as AnthropicResponse;
    const block = data.content.find((b) => b.type === "text");
    if (!block?.text) return null;

    return {
      text: block.text.trim(),
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
      cacheReadTokens: data.usage?.cache_read_input_tokens ?? 0,
      cacheCreationTokens: data.usage?.cache_creation_input_tokens ?? 0,
    };
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      console.error("[llm] timeout");
    } else {
      console.error("[llm] error:", err);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
