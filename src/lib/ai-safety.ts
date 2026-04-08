// AI Safety & Compliance Layer
// Enforces topic boundaries, content moderation, and regulatory compliance

export interface SafetyCheckResult {
  allowed: boolean;
  reason?: string;
  category?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  redirectResponse?: string;
  flags?: string[];
}

// ============================================
// 1. TOPIC BOUNDARY ENFORCEMENT
// ============================================

const ALLOWED_TOPICS = [
  // Mental health
  "anxiety", "depression", "stress", "mood", "emotion", "feeling",
  "panic", "worry", "fear", "sadness", "grief", "loss", "trauma",
  "ptsd", "ocd", "adhd", "bipolar", "phobia",
  // Wellness
  "wellness", "wellbeing", "self-care", "mindfulness", "meditation",
  "breathing", "relaxation", "yoga", "exercise", "fitness", "sleep",
  "insomnia", "nutrition", "diet", "hydration",
  // Relationships
  "relationship", "family", "marriage", "divorce", "partner", "friend",
  "loneliness", "isolation", "communication", "boundary", "conflict",
  // Personal growth
  "self-esteem", "confidence", "motivation", "goal", "habit", "resilience",
  "coping", "anger", "frustration", "burnout", "overwhelm",
  // Therapy-related
  "therapy", "therapist", "session", "progress", "homework", "journal",
  "assessment", "exercise", "technique", "cbt", "mindful",
  // General wellness queries
  "help", "support", "listen", "talk", "advice", "guidance",
  "hello", "hi", "hey", "thank", "bye", "how", "what", "why",
  "better", "worse", "good", "bad", "today", "yesterday", "week",
];

const OFF_TOPIC_PATTERNS = [
  { pattern: /(?:stock|invest|crypto|bitcoin|trading|market|forex)/i, category: "FINANCE" },
  { pattern: /(?:recipe|cook|bake|ingredient|restaurant|food prep)/i, category: "COOKING" },
  { pattern: /(?:code|programming|javascript|python|debug|software|app\s?dev)/i, category: "TECHNOLOGY" },
  { pattern: /(?:politics|election|president|democrat|republican|congress|vote)/i, category: "POLITICS" },
  { pattern: /(?:sports score|game result|football|basketball|soccer|baseball)\s(?:score|result|win|lost)/i, category: "SPORTS" },
  { pattern: /(?:weather forecast|temperature|rain tomorrow)/i, category: "WEATHER" },
  { pattern: /(?:movie review|tv show|netflix|series|film|actor)/i, category: "ENTERTAINMENT" },
  { pattern: /(?:math problem|solve|equation|calculate|algebra)/i, category: "ACADEMICS" },
  { pattern: /(?:write.*essay|homework help|school assignment|exam prep)/i, category: "ACADEMICS" },
  { pattern: /(?:legal advice|lawsuit|attorney|court|sue)/i, category: "LEGAL" },
  { pattern: /(?:make money|side hustle|passive income|business idea)/i, category: "BUSINESS" },
];

// ============================================
// 2. MEDICAL BOUNDARY ENFORCEMENT
// ============================================

const MEDICAL_BOUNDARIES = [
  { pattern: /(?:diagnos[ei]|what.*(?:disorder|condition|disease).*do I have)/i, response: "I'm not able to provide medical diagnoses. A qualified healthcare professional can properly assess your condition. I'd recommend discussing this with your therapist or doctor in your next session." },
  { pattern: /(?:prescri(?:be|ption)|what.*medication|should I take|dosage|mg|pills)/i, response: "I cannot provide medication advice or prescriptions. Medication decisions should always be made with a licensed psychiatrist or physician who knows your medical history." },
  { pattern: /(?:stop.*(?:taking|medication)|quit.*(?:meds|pills)|change.*dosage)/i, response: "Please do not change or stop any medication without consulting your prescribing doctor. Sudden changes can be dangerous. I'd encourage you to schedule an appointment with your physician to discuss this." },
  { pattern: /(?:what.*(?:wrong with me|my diagnosis)|am I (?:crazy|sick|mentally ill|bipolar|autistic|adhd))/i, response: "I understand you're looking for answers, and that takes courage. However, I'm not qualified to diagnose conditions. A licensed mental health professional can provide a proper assessment. Would you like to discuss booking a session with a therapist?" },
  { pattern: /(?:cure|treatment for|how to treat|remedy for).*(?:depression|anxiety|bipolar|schizophrenia|ptsd)/i, response: "Treatment for mental health conditions should be guided by licensed professionals. Everyone's situation is unique. I can support you with coping techniques, but please work with your therapist for a treatment plan." },
];

// ============================================
// 3. CRISIS DETECTION
// ============================================

const CRISIS_PATTERNS = [
  { pattern: /(?:kill\s*(?:my)?self|suicide|suicidal|end\s*(?:my|it all)|don't want to (?:live|be alive|exist))/i, severity: "CRITICAL" as const, category: "SUICIDAL_IDEATION" },
  { pattern: /(?:self[- ]?harm|cut(?:ting)?\s*(?:my)?self|hurt\s*(?:my)?self|burn\s*(?:my)?self)/i, severity: "CRITICAL" as const, category: "SELF_HARM" },
  { pattern: /(?:kill|hurt|harm)\s*(?:someone|them|him|her|my\s*(?:kid|child|partner|spouse))/i, severity: "CRITICAL" as const, category: "HARM_TO_OTHERS" },
  { pattern: /(?:abuse|being\s*(?:hit|beaten|assaulted)|domestic\s*violence|molest)/i, severity: "HIGH" as const, category: "ABUSE" },
  { pattern: /(?:overdose|od['']?d|took too (?:many|much)|swallowed.*pills)/i, severity: "CRITICAL" as const, category: "OVERDOSE" },
  { pattern: /(?:plan\s*(?:to|for)\s*(?:die|end|kill)|method|bridge|gun|rope|jump)/i, severity: "CRITICAL" as const, category: "SUICIDE_PLAN" },
];

const CRISIS_RESPONSE = `I'm concerned about what you're sharing, and I want you to know that your life matters. Please reach out for immediate support:

**988 Suicide & Crisis Lifeline** — Call or text 988 (available 24/7)
**Crisis Text Line** — Text HOME to 741741
**Emergency Services** — Call 911

You don't have to go through this alone. A trained crisis counselor can help you right now. Please reach out to one of these resources.

I'm here to support you, but this situation needs immediate professional help beyond what I can provide.`;

// ============================================
// 4. HARMFUL CONTENT FILTER
// ============================================

const HARMFUL_CONTENT = [
  { pattern: /(?:how to (?:make|build|create).*(?:bomb|weapon|explosive|drug|meth))/i, category: "DANGEROUS_REQUEST" },
  { pattern: /(?:how to (?:hack|steal|break into|exploit))/i, category: "ILLEGAL_REQUEST" },
  { pattern: /(?:child.*(?:porn|sexual|abuse)|minor.*(?:sexual|exploit))/i, category: "CSAM" },
  { pattern: /(?:hate\s*(?:speech|group)|racial\s*slur|nazi|supremac)/i, category: "HATE_SPEECH" },
];

// ============================================
// 5. MINOR-SAFE MODE PATTERNS
// ============================================

const MINOR_SENSITIVE_TOPICS = [
  /(?:sexual|sex life|intercourse|orgasm|pornography)/i,
  /(?:alcohol|drinking|drunk|beer|wine|liquor)/i,
  /(?:drug use|marijuana|cocaine|heroin|weed|smoking|vaping)/i,
  /(?:gambling|betting|casino)/i,
];

// ============================================
// MAIN SAFETY CHECK FUNCTION
// ============================================

export function checkMessageSafety(
  message: string,
  options: { isMinor?: boolean; therapistBoundaries?: string } = {}
): SafetyCheckResult {
  const flags: string[] = [];

  // 1. Check for harmful content (always block)
  for (const harmful of HARMFUL_CONTENT) {
    if (harmful.pattern.test(message)) {
      return {
        allowed: false,
        reason: "This request is outside the scope of wellness support.",
        category: harmful.category,
        severity: "CRITICAL",
        redirectResponse: "I'm a wellness support assistant and can only help with mental health and well-being topics. If you're going through a difficult time, I'm here to listen and support you.",
        flags: [harmful.category],
      };
    }
  }

  // 2. Check for crisis situations (always respond, flag for review)
  for (const crisis of CRISIS_PATTERNS) {
    if (crisis.pattern.test(message)) {
      return {
        allowed: true, // Allow the message but use crisis response
        reason: "Crisis detected",
        category: crisis.category,
        severity: crisis.severity,
        redirectResponse: CRISIS_RESPONSE,
        flags: [crisis.category],
      };
    }
  }

  // 3. Check medical boundaries
  for (const medical of MEDICAL_BOUNDARIES) {
    if (medical.pattern.test(message)) {
      flags.push("MEDICAL_BOUNDARY");
      return {
        allowed: true,
        reason: "Medical boundary triggered",
        category: "MEDICAL",
        severity: "MEDIUM",
        redirectResponse: medical.response,
        flags,
      };
    }
  }

  // 4. Check minor-safe mode
  if (options.isMinor) {
    for (const pattern of MINOR_SENSITIVE_TOPICS) {
      if (pattern.test(message)) {
        flags.push("MINOR_SENSITIVE");
        return {
          allowed: true,
          reason: "Sensitive topic for minor",
          category: "MINOR_SENSITIVE",
          severity: "MEDIUM",
          redirectResponse: "That's an important topic. I'd encourage you to talk to a trusted adult — a parent, school counselor, or therapist — who can give you the right guidance for your situation. I'm here to help with things like managing stress, building confidence, and feeling better.",
          flags,
        };
      }
    }
  }

  // 5. Check therapist-configured boundaries
  if (options.therapistBoundaries) {
    const boundaries = options.therapistBoundaries.toLowerCase();
    // Therapist can set custom restrictions
    if (boundaries.includes("no diagnosis") && message.toLowerCase().match(/diagnos|what.*condition/)) {
      flags.push("THERAPIST_BOUNDARY");
    }
  }

  // 6. Check topic boundaries (is this wellness-related?)
  for (const offTopic of OFF_TOPIC_PATTERNS) {
    if (offTopic.pattern.test(message)) {
      // Check if it might still be wellness-related (e.g., "work stress" contains "work")
      const isAlsoWellness = ALLOWED_TOPICS.some((t) => message.toLowerCase().includes(t));
      if (!isAlsoWellness) {
        flags.push("OFF_TOPIC");
        return {
          allowed: true,
          reason: `Off-topic: ${offTopic.category}`,
          category: "OFF_TOPIC",
          severity: "LOW",
          redirectResponse: `I appreciate your curiosity, but I'm specifically designed to support your mental health and wellness journey. I can help with things like managing stress, improving sleep, coping with anxiety, building better habits, and processing emotions. What would you like to work on today?`,
          flags,
        };
      }
    }
  }

  return { allowed: true, flags };
}

// ============================================
// AUDIT LOG ENTRY
// ============================================

export interface AuditEntry {
  userId: string;
  sessionId: string;
  action: string;
  messageContent: string;
  safetyResult: SafetyCheckResult;
  therapistId?: string;
  isMinor: boolean;
  timestamp: Date;
}

export function createAuditEntry(
  userId: string,
  sessionId: string,
  message: string,
  result: SafetyCheckResult,
  therapistId?: string,
  isMinor = false
): AuditEntry {
  return {
    userId,
    sessionId,
    action: result.redirectResponse ? "SAFETY_REDIRECT" : "NORMAL",
    messageContent: message.substring(0, 500), // Truncate for storage
    safetyResult: result,
    therapistId,
    isMinor,
    timestamp: new Date(),
  };
}

// ============================================
// CONSENT CHECK
// ============================================

export const AI_CONSENT_TEXT = `Before using the AI Wellness Assistant, please understand:

1. **Not a Replacement for Therapy** — This AI provides wellness support but is NOT a licensed therapist, psychologist, or medical professional.

2. **No Diagnoses or Prescriptions** — The AI cannot diagnose conditions, prescribe medication, or provide medical treatment.

3. **Crisis Situations** — If you are in immediate danger or experiencing a mental health crisis, please call 988 (Suicide & Crisis Lifeline) or 911.

4. **Data Privacy** — Your conversations are stored securely to provide personalized support. You can delete your data at any time from Settings > Data Privacy.

5. **Therapist Access** — If you're chatting with a therapist's AI TwinClone, your therapist may review conversations to improve your care. Individual session notes remain private.

6. **Limitations** — AI responses are generated by algorithms and may not always be accurate or appropriate for your situation. Always verify important information with a qualified professional.

7. **Compliance** — This service follows APA guidelines and HIPAA regulations for health data protection.

By continuing, you acknowledge and agree to these terms.`;

export const MINOR_CONSENT_TEXT = `This wellness assistant is designed to support young people. A parent or guardian has authorized your access.

- I can help with stress, confidence, school worries, and feeling better
- I won't discuss topics that are better handled by a trusted adult
- If you're in danger or feeling very unsafe, please tell an adult or call 988
- Your parent/guardian may review usage reports (not individual messages)`;

export const SESSION_DISCLAIMER = "I'm an AI wellness assistant — not a licensed therapist. For emergencies, call 988 or 911.";
