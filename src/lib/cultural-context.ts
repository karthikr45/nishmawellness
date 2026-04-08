// Cultural Context for AI Responses
// Adapts AI responses based on user's cultural background

export interface CulturalContext {
  region: string;
  culturalFactors: string[];
  commonStressors: string[];
  copingSuggestions: string[];
  greetingStyle: string;
  familyDynamics: string;
}

export const CULTURAL_CONTEXTS: Record<string, CulturalContext> = {
  IN: {
    region: "India",
    culturalFactors: [
      "Family expectations and societal pressure",
      "Academic and career competition",
      "Arranged marriage considerations",
      "Joint family dynamics",
      "Cultural stigma around mental health",
      "Respect for elders and authority",
      "Community and social standing",
    ],
    commonStressors: [
      "Parental pressure for academic/career success",
      "Marriage-related stress (arranged marriage, dowry concerns)",
      "Joint family conflicts and boundary issues",
      "Comparison with peers (marks, salary, lifestyle)",
      "Work-life balance in high-pressure IT/corporate jobs",
      "Financial family obligations",
      "Social media pressure and societal expectations",
      "Gender-specific pressures",
    ],
    copingSuggestions: [
      "Pranayama (yogic breathing exercises)",
      "Meditation and mantra practice",
      "Yoga asanas for stress relief",
      "Talking to a trusted family elder",
      "Community support groups",
      "Spiritual practices that resonate with you",
      "Journaling in your preferred language",
      "Ayurvedic wellness practices",
    ],
    greetingStyle: "warm and respectful, acknowledge family context",
    familyDynamics: "Family is central. Joint family decisions, parental expectations, and community reputation are significant factors in mental well-being.",
  },
  US: {
    region: "United States",
    culturalFactors: [
      "Individual autonomy and independence",
      "Work achievement and career identity",
      "Mental health awareness growing",
      "Diverse cultural backgrounds",
    ],
    commonStressors: [
      "Work-life balance",
      "Financial stress",
      "Healthcare access concerns",
      "Relationship dynamics",
      "Social isolation",
    ],
    copingSuggestions: [
      "Mindfulness meditation",
      "Exercise and physical activity",
      "Therapy and counseling",
      "Support groups",
      "Journaling",
    ],
    greetingStyle: "friendly and direct",
    familyDynamics: "Individual-focused with chosen family and friend support networks.",
  },
};

// Generate culturally aware response additions
export function getCulturalEnrichment(message: string, region: string): string {
  const ctx = CULTURAL_CONTEXTS[region];
  if (!ctx) return "";

  const lower = message.toLowerCase();

  if (region === "IN") {
    // Family pressure
    if (lower.match(/parent|family|pressure|expect|disappoint|shame/)) {
      return " I understand that family expectations carry a lot of weight in your life. It's okay to honor your family while also honoring your own needs. Setting boundaries doesn't mean disrespect — it means self-care.";
    }

    // Academic/career competition
    if (lower.match(/exam|marks|rank|iit|jee|neet|placement|cgpa|percentage|topper/)) {
      return " Academic pressure can feel immense, especially when it feels like your worth is measured by marks. Remember — you are more than a score. Let's talk about managing this pressure in a healthy way.";
    }

    // Marriage-related
    if (lower.match(/marriage|arrange|rishta|shaadi|in-laws|sasural|dowry/)) {
      return " Marriage decisions and family dynamics can be deeply complex. Your feelings about this are valid, regardless of what tradition expects. What matters most is what feels right for you.";
    }

    // Comparison
    if (lower.match(/compar|log kya kahenge|sharma ji|neighbor|relative|cousin/)) {
      return " Comparison with others — especially when relatives or society reinforces it — can be exhausting. Your journey is unique. Let's focus on what success and happiness mean to you, not to others.";
    }

    // Stigma
    if (lower.match(/stigma|don't.*understand|weak|pagal|crazy|mental|therapy.*wrong/)) {
      return " Seeking help is not weakness — it's wisdom. Mental health matters just as much as physical health. You're taking a brave step by being here, and that takes real strength.";
    }

    // Spiritual/yoga
    if (lower.match(/yoga|pranayam|meditation|mantra|spiritual|prayer|puja|temple/)) {
      return " Spiritual practices can be deeply healing. Pranayama, meditation, and yoga have centuries of wisdom behind them. Would you like to explore a specific practice together?";
    }
  }

  return "";
}

// Student-specific context
export function getStudentEnrichment(message: string): string {
  const lower = message.toLowerCase();

  if (lower.match(/exam|test|study|marks|grade|fail|pass|score/)) {
    return " Exam stress is one of the most common things students experience. Your worth is not defined by a single exam. Let's work on strategies to manage this pressure while still performing your best.";
  }

  if (lower.match(/peer|bully|friend|lonely|fit in|belong|left out|popular/)) {
    return " Social dynamics in school/college can be really tough. Feeling like you don't belong is more common than you think. What matters is finding even one person who gets you.";
  }

  if (lower.match(/career|future|job|placement|what.*do with.*life|confused|direction/)) {
    return " Uncertainty about the future is completely normal. You don't need to have it all figured out right now. Let's explore what genuinely interests you, not what others expect.";
  }

  if (lower.match(/parent.*pressure|mom.*dad|family.*expect|disappoint.*parent/)) {
    return " Many students feel caught between their own dreams and parental expectations. Both matter, and finding balance is a skill we can work on together.";
  }

  return "";
}
