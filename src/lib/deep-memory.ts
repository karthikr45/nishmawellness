// Deep Memory Engine
// Extracts specific details, commitments, people, events from conversations
// and uses them to make every session feel like a continuation

import { prisma } from "@/lib/prisma";

// ============================================
// 1. MEMORY EXTRACTION — What to remember
// ============================================

interface ExtractedMemory {
  category: string;
  content: string;
  context: string;
}

export async function extractDeepMemories(userId: string, message: string, sessionId: string): Promise<void> {
  const memories: ExtractedMemory[] = [];

  // --- SPECIFIC PEOPLE mentioned ---
  const personPatterns = [
    { pattern: /my (?:boss|manager|supervisor)\s+(\w+)?/i, role: "boss" },
    { pattern: /my (?:partner|husband|wife|boyfriend|girlfriend|spouse)\s+(\w+)?/i, role: "partner" },
    { pattern: /my (?:mom|mother|dad|father|mum)\s+(\w+)?/i, role: "parent" },
    { pattern: /my (?:son|daughter|child|kid)\s+(\w+)?/i, role: "child" },
    { pattern: /my (?:friend|best friend|roommate|coworker|colleague)\s+(\w+)?/i, role: "friend/colleague" },
    { pattern: /my (?:therapist|doctor|psychiatrist)\s+(?:Dr\.?\s+)?(\w+)?/i, role: "healthcare provider" },
    { pattern: /my (?:sister|brother|sibling)\s+(\w+)?/i, role: "sibling" },
  ];

  for (const { pattern, role } of personPatterns) {
    const match = message.match(pattern);
    if (match) {
      const name = match[1] || "";
      memories.push({
        category: "PERSON",
        content: name ? `${role}: ${name}` : role,
        context: message.substring(0, 300),
      });
    }
  }

  // --- SPECIFIC EVENTS & DETAILS ---
  const eventPatterns = [
    { pattern: /(?:got|received|started|had)\s+(?:a\s+)?(?:new job|promotion|raise|interview|offer)/i, event: "career change" },
    { pattern: /(?:got|getting)\s+(?:married|engaged|divorced|separated)/i, event: "relationship milestone" },
    { pattern: /(?:moved|moving)\s+(?:to|into|out)/i, event: "relocation" },
    { pattern: /(?:pregnant|expecting|baby|gave birth|newborn)/i, event: "new child" },
    { pattern: /(?:passed away|died|lost|funeral|death of)/i, event: "loss/grief" },
    { pattern: /(?:graduated|finishing|completed)\s+(?:school|college|university|degree|program)/i, event: "graduation" },
    { pattern: /(?:fired|laid off|lost my job|unemployed|let go)/i, event: "job loss" },
    { pattern: /(?:accident|surgery|hospital|diagnosed|illness|injury)/i, event: "health event" },
    { pattern: /(?:broke up|breakup|ended|left me|dumped)/i, event: "breakup" },
    { pattern: /(?:argument|fight|conflict|confrontation)\s+(?:with)/i, event: "conflict" },
    { pattern: /(?:deadline|presentation|exam|test|review)\s+(?:at|for|this|next|coming)/i, event: "upcoming deadline" },
    { pattern: /(?:meeting|conversation|talk)\s+(?:with)\s+(?:my\s+)?(?:boss|manager|hr|partner|parent|doctor)/i, event: "important conversation" },
  ];

  for (const { pattern, event } of eventPatterns) {
    if (pattern.test(message)) {
      memories.push({
        category: "EVENT",
        content: event,
        context: message.substring(0, 300),
      });
    }
  }

  // --- COMMITMENTS & INTENTIONS ("I'm going to...", "I'll try...") ---
  const commitmentPatterns = [
    /(?:I(?:'m| am) going to|I(?:'ll| will)|I plan to|I want to try|I(?:'ll| will) try)\s+(.{10,80})/i,
    /(?:next week I|tomorrow I|this week I|tonight I)\s*(?:'ll|will|am going to|want to)?\s*(.{10,80})/i,
    /(?:I need to|I should|I have to)\s+(.{10,80})/i,
  ];

  for (const pattern of commitmentPatterns) {
    const match = message.match(pattern);
    if (match) {
      const commitment = match[1].replace(/[.!?,]+$/, "").trim();
      if (commitment.length > 10) {
        memories.push({
          category: "COMMITMENT",
          content: commitment,
          context: message.substring(0, 300),
        });
      }
    }
  }

  // --- SPECIFIC DETAILS (numbers, places, dates) ---
  const detailPatterns = [
    { pattern: /(?:for|since|about)\s+(\d+)\s+(?:years?|months?|weeks?|days?)/i, detail: "duration" },
    { pattern: /(?:I work|I(?:'m| am) working)\s+(?:at|for|in)\s+(.{5,40})/i, detail: "workplace" },
    { pattern: /(?:I live|I(?:'m| am) living)\s+(?:in|at)\s+(.{5,40})/i, detail: "location" },
    { pattern: /(?:I(?:'m| am))\s+(\d{2})\s+(?:years? old)?/i, detail: "age" },
    { pattern: /(?:sleep|sleeping)\s+(?:only\s+)?(\d+)\s+hours?/i, detail: "sleep hours" },
    { pattern: /(?:medication|taking|prescribed)\s+(\w+(?:\s+\w+)?)\s+(?:\d+\s*mg)?/i, detail: "medication" },
  ];

  for (const { pattern, detail } of detailPatterns) {
    const match = message.match(pattern);
    if (match) {
      memories.push({
        category: "DETAIL",
        content: `${detail}: ${match[1] || match[0]}`,
        context: message.substring(0, 300),
      });
    }
  }

  // --- COPING TOOLS (what helps them) ---
  const copingPatterns = [
    { pattern: /(?:helps me|helped me|works for me|I feel better when)\s*(?:is\s+|to\s+)?(.{5,60})/i, tool: null },
    { pattern: /(?:I tried|I started|I've been)\s+(.{5,60})(?:\s+and\s+(?:it|that)\s+(?:helped|worked|made me feel))/i, tool: null },
    { pattern: /(?:meditation|yoga|exercise|running|walking|journaling|reading|music|cooking|gardening|prayer|breathing)/i, tool: null },
  ];

  for (const { pattern } of copingPatterns) {
    const match = message.match(pattern);
    if (match) {
      const tool = (match[1] || match[0]).replace(/[.!?,]+$/, "").trim();
      if (tool.length > 3 && tool.length < 60) {
        memories.push({
          category: "COPING",
          content: tool,
          context: message.substring(0, 300),
        });
      }
    }
  }

  // --- ONGOING TOPICS with sentiment ---
  const topicPatterns = [
    { pattern: /(?:work|job|boss|career|office|deadline|colleague|coworker)/i, topic: "Work & Career" },
    { pattern: /(?:relationship|partner|marriage|dating|spouse|husband|wife|boyfriend|girlfriend)/i, topic: "Relationships" },
    { pattern: /(?:family|parent|mother|father|child|son|daughter|sibling)/i, topic: "Family" },
    { pattern: /(?:anxiety|anxious|panic|worried|nervous|fear|phobia)/i, topic: "Anxiety" },
    { pattern: /(?:depress|sad|hopeless|empty|numb|meaningless|worthless)/i, topic: "Depression" },
    { pattern: /(?:sleep|insomnia|nightmare|tired|exhausted|fatigue)/i, topic: "Sleep" },
    { pattern: /(?:anger|angry|frustrat|irritat|rage|furious)/i, topic: "Anger" },
    { pattern: /(?:confidence|self.?esteem|worth|inadequate|imposter)/i, topic: "Self-Esteem" },
    { pattern: /(?:grief|loss|mourning|miss(?:ing)?|death|passed)/i, topic: "Grief" },
    { pattern: /(?:trauma|ptsd|flashback|trigger|abuse|assault)/i, topic: "Trauma" },
    { pattern: /(?:lonely|isolated|alone|no friends|disconnected)/i, topic: "Loneliness" },
    { pattern: /(?:overwhelm|burnout|too much|can't cope|breaking point)/i, topic: "Burnout" },
  ];

  for (const { pattern, topic } of topicPatterns) {
    if (pattern.test(message)) {
      memories.push({
        category: "TOPIC",
        content: topic,
        context: message.substring(0, 300),
      });
    }
  }

  // --- MILESTONES / PROGRESS ---
  const milestonePatterns = [
    { pattern: /(?:first time|for the first time)\s+(?:I|in)\s+(.{5,60})/i, milestone: null },
    { pattern: /(?:finally|managed to|was able to|succeeded|accomplished)\s+(.{5,60})/i, milestone: null },
    { pattern: /(?:it(?:'s| is| has) been)\s+(?:getting\s+)?(?:better|easier|worse|harder)/i, milestone: "progress shift" },
    { pattern: /(?:\d+)\s+(?:days?|weeks?|months?)\s+(?:sober|clean|without|since)/i, milestone: "sobriety/streak" },
  ];

  for (const { pattern } of milestonePatterns) {
    const match = message.match(pattern);
    if (match) {
      memories.push({
        category: "MILESTONE",
        content: (match[1] || match[0]).replace(/[.!?,]+$/, "").trim(),
        context: message.substring(0, 300),
      });
    }
  }

  // ============================================
  // 2. STORE MEMORIES — Deduplicate & update weights
  // ============================================

  for (const mem of memories) {
    // Check for existing similar memory
    const existing = await prisma.aIMemory.findFirst({
      where: {
        userId,
        category: mem.category,
        content: mem.content,
      },
    });

    if (existing) {
      // Update: boost weight, update context, increment mention count
      await prisma.aIMemory.update({
        where: { id: existing.id },
        data: {
          weight: Math.min(existing.weight + 0.5, 10.0),
          mentionCount: existing.mentionCount + 1,
          lastMentioned: new Date(),
          context: mem.context, // Update to latest context
          sessionId,
        },
      });
    } else {
      // Create new memory
      await prisma.aIMemory.create({
        data: {
          userId,
          category: mem.category,
          content: mem.content,
          context: mem.context,
          source: "AI_CHAT",
          sessionId,
          weight: 1.0,
          mentionCount: 1,
        },
      });
    }
  }
}

// ============================================
// 3. RETRIEVE MEMORIES — Build context for AI
// ============================================

export interface MemoryContext {
  name: string;
  topTopics: { content: string; mentionCount: number; lastMentioned: Date }[];
  recentEvents: { content: string; context: string; createdAt: Date }[];
  activeCommitments: { content: string; context: string; createdAt: Date }[];
  knownPeople: { content: string }[];
  copingTools: { content: string }[];
  details: { content: string }[];
  milestones: { content: string; context: string }[];
  patterns: { topic: string; frequency: number; dayOfWeek?: string }[];
  sessionCount: number;
  lastSessionDate: Date | null;
  daysSinceLastChat: number;
  moodTrend: string;
  avgMood: number | null;
  recentChatSnippets: { content: string; createdAt: Date }[];
}

export async function getMemoryContext(userId: string): Promise<MemoryContext> {
  const [user, memories, recentChats, progress, lastChat] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.aIMemory.findMany({
      where: { userId },
      orderBy: [{ weight: "desc" }, { lastMentioned: "desc" }],
      take: 50,
    }),
    prisma.aIChat.findMany({
      where: { userId, role: "user" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.progress.findMany({
      where: { userId, type: "MOOD" },
      orderBy: { date: "desc" },
      take: 14,
    }),
    prisma.aIChat.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const firstName = user?.name?.split(" ")[0] || "";

  // Group memories by category
  const byCategory = (cat: string) => memories.filter((m) => m.category === cat);

  // Detect patterns — which topics come up most and when
  const topicMentions = byCategory("TOPIC");
  const patterns: { topic: string; frequency: number }[] = [];
  const topicCounts: Record<string, number> = {};
  for (const m of topicMentions) {
    topicCounts[m.content] = (topicCounts[m.content] || 0) + m.mentionCount;
  }
  for (const [topic, freq] of Object.entries(topicCounts)) {
    if (freq >= 2) {
      patterns.push({ topic, frequency: freq });
    }
  }
  patterns.sort((a, b) => b.frequency - a.frequency);

  // Mood trend
  const avgMood = progress.length > 0
    ? Math.round(progress.reduce((s, p) => s + p.value, 0) / progress.length)
    : null;
  const recentMood = progress.length >= 2 ? progress[0].value : null;
  const olderMood = progress.length >= 7 ? progress[6].value : null;
  const moodTrend = recentMood && olderMood
    ? recentMood > olderMood ? "improving" : recentMood < olderMood ? "declining" : "stable"
    : "unknown";

  // Days since last chat
  const daysSinceLastChat = lastChat
    ? Math.floor((Date.now() - new Date(lastChat.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  // Session count (unique sessions)
  const sessionIds = new Set(recentChats.map((c) => c.sessionId));

  return {
    name: firstName,
    topTopics: topicMentions
      .sort((a, b) => b.mentionCount - a.mentionCount)
      .slice(0, 5)
      .map((m) => ({ content: m.content, mentionCount: m.mentionCount, lastMentioned: m.lastMentioned })),
    recentEvents: byCategory("EVENT").slice(0, 5).map((m) => ({ content: m.content, context: m.context, createdAt: m.createdAt })),
    activeCommitments: byCategory("COMMITMENT").filter((m) => !m.isResolved).slice(0, 5).map((m) => ({ content: m.content, context: m.context, createdAt: m.createdAt })),
    knownPeople: byCategory("PERSON").map((m) => ({ content: m.content })),
    copingTools: byCategory("COPING").slice(0, 5).map((m) => ({ content: m.content })),
    details: byCategory("DETAIL").map((m) => ({ content: m.content })),
    milestones: byCategory("MILESTONE").slice(0, 5).map((m) => ({ content: m.content, context: m.context })),
    patterns,
    sessionCount: sessionIds.size,
    lastSessionDate: lastChat?.createdAt || null,
    daysSinceLastChat,
    moodTrend,
    avgMood,
    recentChatSnippets: recentChats.slice(0, 5).map((c) => ({ content: c.content, createdAt: c.createdAt })),
  };
}

// ============================================
// 4. GENERATE PROACTIVE OPENING — Session 47 style
// ============================================

export function generateProactiveOpening(ctx: MemoryContext): string {
  const { name, topTopics, activeCommitments, recentEvents, daysSinceLastChat, moodTrend, sessionCount, recentChatSnippets, patterns, milestones, copingTools, knownPeople } = ctx;

  // First-time user
  if (sessionCount <= 1 && topTopics.length === 0) {
    return `Hello${name ? `, ${name}` : ""}! Welcome. I'm here to support your wellness journey. This is a safe, confidential space. What's on your mind today?`;
  }

  let opening = "";

  // Returning after a long break
  if (daysSinceLastChat >= 14) {
    opening = `${name ? name + ", it's" : "It's"} really good to see you back. It's been ${daysSinceLastChat} days since we last talked.`;
    if (topTopics.length > 0) {
      opening += ` Last time, we were exploring ${topTopics[0].content.toLowerCase()}. How have things been going since then?`;
    }
    return opening;
  }

  // Check for commitments to follow up on
  if (activeCommitments.length > 0) {
    const commitment = activeCommitments[0];
    const daysAgo = Math.floor((Date.now() - new Date(commitment.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    if (daysAgo >= 1 && daysAgo <= 14) {
      opening = `${name ? name + ", last" : "Last"} ${daysAgo === 1 ? "time" : `${daysAgo} days ago`} you mentioned you were going to ${commitment.content.toLowerCase()}. How did that go?`;
      return opening;
    }
  }

  // Reference recent events
  if (recentEvents.length > 0) {
    const event = recentEvents[0];
    const daysAgo = Math.floor((Date.now() - new Date(event.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    if (daysAgo <= 7) {
      opening = `${name ? name + ", you" : "You"} mentioned ${event.content.toLowerCase()} recently. I've been thinking about that. How are you feeling about it now?`;
      return opening;
    }
  }

  // Reference recent chat content specifically
  if (recentChatSnippets.length > 0) {
    const lastMsg = recentChatSnippets[0];
    const daysAgo = Math.floor((Date.now() - new Date(lastMsg.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    if (daysAgo <= 3 && topTopics.length > 0) {
      opening = `${name ? name + ", welcome" : "Welcome"} back. Last time we were talking about ${topTopics[0].content.toLowerCase()}.`;

      // Add mood awareness
      if (moodTrend === "improving") {
        opening += ` I've noticed your mood has been trending up — that's great progress!`;
      } else if (moodTrend === "declining") {
        opening += ` I want to check in because your mood scores have been a bit lower lately.`;
      }

      opening += ` How are things today?`;
      return opening;
    }
  }

  // Pattern-based opening
  if (patterns.length > 0 && patterns[0].frequency >= 3) {
    const topPattern = patterns[0];
    opening = `${name ? name + ", I" : "I"}'ve noticed that ${topPattern.topic.toLowerCase()} has come up in ${topPattern.frequency} of our conversations. I think there's something important there. Would you like to explore it further today?`;
    return opening;
  }

  // Milestone celebration
  if (milestones.length > 0) {
    const milestone = milestones[0];
    opening = `${name ? name + ", I" : "I"} remember you sharing that you ${milestone.content.toLowerCase()}. That was a real achievement. How has that continued since then?`;
    return opening;
  }

  // Default contextual opening
  if (topTopics.length > 0) {
    opening = `${name ? `Hi ${name}` : "Hi"}! `;
    if (sessionCount > 5) {
      opening += `We've had ${sessionCount} conversations now, and I feel like I'm getting to know what matters most to you. `;
    }
    opening += `Last time we focused on ${topTopics[0].content.toLowerCase()}. Where would you like to start today?`;
    return opening;
  }

  return `${name ? `Hello ${name}` : "Hello"}! Good to see you again. How are you feeling today?`;
}

// ============================================
// 5. GENERATE CONTEXT-AWARE FOLLOW-UPS
// ============================================

export function enrichResponseWithMemory(response: string, ctx: MemoryContext, userMessage: string): string {
  const lower = userMessage.toLowerCase();
  let enriched = response;

  // If user mentions progress, reference their journey
  if (lower.match(/better|progress|improved|getting there/)) {
    if (ctx.sessionCount > 3 && ctx.avgMood) {
      enriched += ` Since we've been talking, I can see real growth in how you approach things. That's not nothing — that's ${ctx.sessionCount} conversations of showing up for yourself.`;
    }
  }

  // If topic matches a known person, reference them
  if (lower.match(/boss|manager|work/) && ctx.knownPeople.some((p) => p.content.includes("boss"))) {
    const boss = ctx.knownPeople.find((p) => p.content.includes("boss"));
    if (boss && boss.content.includes(":")) {
      const bossName = boss.content.split(":")[1].trim();
      if (bossName) {
        enriched = enriched.replace(/your boss/i, `your boss${bossName ? ` ${bossName}` : ""}`);
      }
    }
  }

  // If talking about coping, reference what's worked before
  if (lower.match(/help|cope|deal with|manage|handle/) && ctx.copingTools.length > 0) {
    const tool = ctx.copingTools[0].content;
    if (!enriched.toLowerCase().includes(tool.toLowerCase())) {
      enriched += ` I also remember that ${tool.toLowerCase()} has been helpful for you in the past. Would that be worth trying here too?`;
    }
  }

  // If anxiety comes up frequently, acknowledge the pattern
  if (lower.match(/anxious|anxiety/) && ctx.patterns.some((p) => p.topic === "Anxiety" && p.frequency >= 3)) {
    const freq = ctx.patterns.find((p) => p.topic === "Anxiety")!.frequency;
    enriched = enriched.replace(
      /I hear/,
      `I hear this, and I want you to know that we've talked about anxiety in ${freq} of our conversations now — I see the pattern, and I'm here to keep working through it with you. I hear`
    );
  }

  return enriched;
}
