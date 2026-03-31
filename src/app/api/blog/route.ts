import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// In-memory blog storage (in production, use database)
const BLOG_POSTS = [
  {
    id: "1",
    title: "5 Evidence-Based Techniques for Managing Anxiety",
    slug: "managing-anxiety-techniques",
    excerpt: "Learn proven methods that therapists recommend for managing anxiety in daily life, from breathing exercises to cognitive reframing.",
    content: "Anxiety affects millions of people worldwide, but the good news is that there are evidence-based techniques that can help you manage it effectively...\n\n## 1. Deep Breathing (4-7-8 Technique)\nThis technique activates your parasympathetic nervous system...\n\n## 2. Progressive Muscle Relaxation\nBy systematically tensing and releasing muscle groups...\n\n## 3. Cognitive Restructuring\nIdentify and challenge negative thought patterns...\n\n## 4. Grounding Exercises (5-4-3-2-1)\nUse your five senses to anchor yourself in the present...\n\n## 5. Regular Mindfulness Practice\nEven 10 minutes of daily mindfulness meditation can significantly reduce anxiety symptoms...",
    author: "Dr. Sarah Johnson",
    category: "Mental Health",
    tags: ["anxiety", "coping", "techniques", "CBT"],
    image: "/images/blog/anxiety.jpg",
    publishedAt: "2026-03-15",
    readTime: 8,
  },
  {
    id: "2",
    title: "The Science Behind Meditation and Brain Health",
    slug: "meditation-brain-health",
    excerpt: "Discover how regular meditation practice physically changes your brain structure and improves mental wellness.",
    content: "Recent neuroscience research has revealed remarkable findings about how meditation affects the brain...\n\n## Structural Changes\nStudies show that regular meditators have increased gray matter density in areas associated with learning, memory, and emotional regulation...\n\n## Stress Reduction\nMeditation reduces activity in the amygdala, your brain's fight-or-flight center...\n\n## Improved Focus\nMindfulness meditation strengthens the prefrontal cortex, enhancing attention and decision-making...",
    author: "Dr. Michael Chen",
    category: "Wellness",
    tags: ["meditation", "neuroscience", "brain", "mindfulness"],
    image: "/images/blog/meditation.jpg",
    publishedAt: "2026-03-10",
    readTime: 6,
  },
  {
    id: "3",
    title: "Building Resilience: A Guide for Working Professionals",
    slug: "building-resilience-professionals",
    excerpt: "Practical strategies for building mental resilience in high-pressure work environments without sacrificing well-being.",
    content: "In today's fast-paced work environment, resilience isn't just nice to have — it's essential...\n\n## What is Resilience?\nResilience is the ability to adapt and bounce back from adversity...\n\n## Key Strategies\n1. Set clear boundaries between work and personal life\n2. Practice daily stress management\n3. Build a support network\n4. Develop a growth mindset\n5. Prioritize sleep and physical health...",
    author: "Dr. Emily Rivera",
    category: "Career",
    tags: ["resilience", "workplace", "stress", "balance"],
    image: "/images/blog/resilience.jpg",
    publishedAt: "2026-03-05",
    readTime: 7,
  },
  {
    id: "4",
    title: "Nutrition and Mental Health: The Gut-Brain Connection",
    slug: "nutrition-mental-health",
    excerpt: "How what you eat directly impacts your mood, anxiety levels, and overall mental well-being.",
    content: "The emerging field of nutritional psychiatry reveals a powerful connection between diet and mental health...\n\n## The Gut-Brain Axis\nYour gut produces 95% of your body's serotonin...\n\n## Foods That Boost Mental Health\n- Omega-3 fatty acids (salmon, walnuts)\n- Fermented foods (yogurt, kimchi)\n- Leafy greens and vegetables\n- Complex carbohydrates\n- Berries and antioxidants...",
    author: "Dr. James Patel",
    category: "Nutrition",
    tags: ["nutrition", "gut-brain", "diet", "mental-health"],
    image: "/images/blog/nutrition.jpg",
    publishedAt: "2026-02-28",
    readTime: 9,
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const slug = searchParams.get("slug");

  if (slug) {
    const post = BLOG_POSTS.find((p) => p.slug === slug);
    return NextResponse.json(post || null);
  }

  let posts = BLOG_POSTS;
  if (category) {
    posts = posts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  // In production, save to database
  return NextResponse.json({ ...body, id: `new-${Date.now()}` });
}
