import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (order matters for foreign keys)
  await prisma.sessionHandoff.deleteMany();
  await prisma.twinCloneReview.deleteMany();
  await prisma.twinCloneProfile.deleteMany();
  await prisma.exerciseLog.deleteMany();
  await prisma.guidedExercise.deleteMany();
  await prisma.groupSessionMember.deleteMany();
  await prisma.groupSession.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.onboardingResponse.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.familyGroup.deleteMany();
  await prisma.orgAnalytics.deleteMany();
  await prisma.orgProgram.deleteMany();
  await prisma.orgMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.continuityScore.deleteMany();
  await prisma.userActivity.deleteMany();
  await prisma.aIMemory.deleteMany();
  await prisma.patientContext.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.sessionNote.deleteMany();
  await prisma.aIChat.deleteMany();
  await prisma.message.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.program.deleteMany();
  await prisma.user.deleteMany();

  const password = await hash("password123", 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@nishmawellness.com",
      password,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  // Create Therapists
  const therapist1 = await prisma.user.create({
    data: {
      email: "dr.sarah@nishmawellness.com",
      password,
      name: "Dr. Sarah Johnson",
      role: "THERAPIST",
      bio: "Licensed Clinical Psychologist with 15 years of experience specializing in cognitive behavioral therapy, anxiety disorders, and mindfulness-based stress reduction.",
      specialization: "Clinical Psychology, CBT, Mindfulness",
      licenseNumber: "PSY-2024-001",
      experience: 15,
      hourlyRate: 150,
      phone: "+1 (555) 100-0001",
    },
  });

  const therapist2 = await prisma.user.create({
    data: {
      email: "dr.michael@nishmawellness.com",
      password,
      name: "Dr. Michael Chen",
      role: "THERAPIST",
      bio: "Board-certified psychiatrist specializing in integrative mental health, combining traditional therapy with holistic wellness approaches including yoga therapy and nutritional psychiatry.",
      specialization: "Integrative Psychiatry, Yoga Therapy",
      licenseNumber: "PSY-2024-002",
      experience: 12,
      hourlyRate: 175,
      phone: "+1 (555) 100-0002",
    },
  });

  const therapist3 = await prisma.user.create({
    data: {
      email: "dr.emily@nishmawellness.com",
      password,
      name: "Dr. Emily Rivera",
      role: "THERAPIST",
      bio: "Certified marriage and family therapist with expertise in relationship counseling, trauma recovery, and emotional wellness coaching.",
      specialization: "Family Therapy, Trauma Recovery",
      licenseNumber: "MFT-2024-003",
      experience: 10,
      hourlyRate: 135,
      phone: "+1 (555) 100-0003",
    },
  });

  const therapist4 = await prisma.user.create({
    data: {
      email: "dr.james@nishmawellness.com",
      password,
      name: "Dr. James Patel",
      role: "THERAPIST",
      bio: "Sports psychologist and wellness coach helping individuals achieve peak mental performance through mindfulness, meditation, and cognitive training techniques.",
      specialization: "Sports Psychology, Performance Coaching",
      licenseNumber: "PSY-2024-004",
      experience: 8,
      hourlyRate: 140,
      phone: "+1 (555) 100-0004",
    },
  });

  // Create Patients
  const patient1 = await prisma.user.create({
    data: {
      email: "patient@example.com",
      password,
      name: "Alex Thompson",
      role: "PATIENT",
      phone: "+1 (555) 200-0001",
    },
  });

  const patient2 = await prisma.user.create({
    data: {
      email: "jane@example.com",
      password,
      name: "Jane Cooper",
      role: "PATIENT",
      phone: "+1 (555) 200-0002",
    },
  });

  // Create Availability for therapists
  const therapists = [therapist1, therapist2, therapist3, therapist4];
  for (const therapist of therapists) {
    for (let day = 1; day <= 5; day++) {
      await prisma.availability.create({
        data: {
          therapistId: therapist.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
      });
    }
  }

  // Create Programs
  const programs = [
    {
      title: "Mindfulness Meditation Mastery",
      description: "An 8-week comprehensive program designed to help you develop a consistent meditation practice. Learn various techniques from guided visualization to body scanning, reducing stress and improving mental clarity.",
      category: "MEDITATION",
      duration: "8 weeks",
      level: "BEGINNER",
      price: 99,
      image: "/images/meditation.jpg",
      modules: JSON.stringify([
        { title: "Introduction to Mindfulness", lessons: 4, duration: "45 min each" },
        { title: "Breath Awareness", lessons: 4, duration: "45 min each" },
        { title: "Body Scan Meditation", lessons: 3, duration: "50 min each" },
        { title: "Walking Meditation", lessons: 3, duration: "40 min each" },
        { title: "Loving-Kindness Practice", lessons: 4, duration: "45 min each" },
        { title: "Mindful Living Integration", lessons: 4, duration: "50 min each" },
      ]),
    },
    {
      title: "Yoga for Mental Wellness",
      description: "Combine physical yoga postures with mental health techniques. This program focuses on stress reduction, emotional regulation, and building a mind-body connection through therapeutic yoga sequences.",
      category: "YOGA",
      duration: "6 weeks",
      level: "BEGINNER",
      price: 79,
      image: "/images/yoga.jpg",
      modules: JSON.stringify([
        { title: "Foundations of Therapeutic Yoga", lessons: 4, duration: "60 min each" },
        { title: "Stress-Release Sequences", lessons: 4, duration: "60 min each" },
        { title: "Breathing & Pranayama", lessons: 3, duration: "45 min each" },
        { title: "Restorative Yoga", lessons: 4, duration: "60 min each" },
        { title: "Yoga Nidra & Deep Relaxation", lessons: 3, duration: "45 min each" },
      ]),
    },
    {
      title: "Cognitive Behavioral Training",
      description: "Learn proven CBT techniques to identify and change negative thought patterns. This self-paced program equips you with practical tools for managing anxiety, depression, and daily stress.",
      category: "MENTAL_HEALTH",
      duration: "10 weeks",
      level: "INTERMEDIATE",
      price: 149,
      image: "/images/cbt.jpg",
      modules: JSON.stringify([
        { title: "Understanding Your Thoughts", lessons: 5, duration: "40 min each" },
        { title: "Cognitive Distortions", lessons: 4, duration: "45 min each" },
        { title: "Thought Challenging", lessons: 5, duration: "45 min each" },
        { title: "Behavioral Activation", lessons: 4, duration: "40 min each" },
        { title: "Building Resilience", lessons: 4, duration: "45 min each" },
        { title: "Maintaining Progress", lessons: 3, duration: "40 min each" },
      ]),
    },
    {
      title: "Holistic Nutrition for Wellness",
      description: "Discover how nutrition impacts your mental and physical health. Learn to create meal plans that boost mood, energy, and overall well-being with evidence-based nutritional strategies.",
      category: "NUTRITION",
      duration: "6 weeks",
      level: "BEGINNER",
      price: 89,
      image: "/images/nutrition.jpg",
      modules: JSON.stringify([
        { title: "Nutrition & Mental Health", lessons: 3, duration: "35 min each" },
        { title: "Anti-Inflammatory Diet", lessons: 4, duration: "40 min each" },
        { title: "Gut-Brain Connection", lessons: 3, duration: "40 min each" },
        { title: "Meal Planning Basics", lessons: 4, duration: "45 min each" },
        { title: "Supplements & Superfoods", lessons: 3, duration: "35 min each" },
      ]),
    },
    {
      title: "Strength & Resilience Fitness",
      description: "A fitness program designed for mental health benefits. Combines strength training, cardio, and flexibility work to boost endorphins, reduce anxiety, and build physical confidence.",
      category: "FITNESS",
      duration: "8 weeks",
      level: "INTERMEDIATE",
      price: 119,
      image: "/images/fitness.jpg",
      modules: JSON.stringify([
        { title: "Foundation Strength", lessons: 5, duration: "45 min each" },
        { title: "Cardio for Mental Clarity", lessons: 4, duration: "40 min each" },
        { title: "Flexibility & Recovery", lessons: 4, duration: "35 min each" },
        { title: "High-Intensity Mindful Training", lessons: 5, duration: "45 min each" },
        { title: "Integration & Maintenance", lessons: 4, duration: "40 min each" },
      ]),
    },
    {
      title: "Stress Management Toolkit",
      description: "Master practical stress management techniques for everyday life. From progressive muscle relaxation to time management, build your personal toolkit for handling life's challenges.",
      category: "STRESS_MANAGEMENT",
      duration: "4 weeks",
      level: "BEGINNER",
      price: 69,
      image: "/images/stress.jpg",
      modules: JSON.stringify([
        { title: "Understanding Stress", lessons: 3, duration: "30 min each" },
        { title: "Relaxation Techniques", lessons: 4, duration: "35 min each" },
        { title: "Time & Energy Management", lessons: 3, duration: "35 min each" },
        { title: "Building Your Toolkit", lessons: 4, duration: "40 min each" },
      ]),
    },
  ];

  for (const program of programs) {
    await prisma.program.create({ data: program });
  }

  // Create sample appointments
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      therapistId: therapist1.id,
      dateTime: tomorrow,
      duration: 60,
      type: "VIDEO",
      status: "CONFIRMED",
      meetingUrl: "/video-session/room-001",
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      therapistId: therapist2.id,
      dateTime: nextWeek,
      duration: 45,
      type: "VIDEO",
      status: "SCHEDULED",
    },
  });

  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - 3);
  pastDate.setHours(11, 0, 0, 0);

  const pastAppointment = await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      therapistId: therapist1.id,
      dateTime: pastDate,
      duration: 60,
      type: "VIDEO",
      status: "COMPLETED",
    },
  });

  // Create session note for past appointment
  await prisma.sessionNote.create({
    data: {
      appointmentId: pastAppointment.id,
      therapistId: therapist1.id,
      content: "Patient discussed work-related stress and anxiety. Practiced deep breathing exercises and cognitive reframing techniques.",
      mood: "Moderate anxiety, improving",
      progress: "Good progress with breathing exercises. Patient reports better sleep quality.",
      homework: "Practice 10-minute morning meditation daily. Keep a thought journal.",
    },
  });

  // Create progress records for patient
  const progressTypes = ["MOOD", "SLEEP", "EXERCISE", "MINDFULNESS"];
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    for (const type of progressTypes) {
      await prisma.progress.create({
        data: {
          userId: patient1.id,
          type,
          value: Math.floor(Math.random() * 40) + 60,
          date,
        },
      });
    }
  }

  // Enroll patient in a program
  const allPrograms = await prisma.program.findMany();
  if (allPrograms.length > 0) {
    await prisma.enrollment.create({
      data: {
        userId: patient1.id,
        programId: allPrograms[0].id,
        progress: 35,
        status: "ACTIVE",
      },
    });
    await prisma.enrollment.create({
      data: {
        userId: patient1.id,
        programId: allPrograms[3].id,
        progress: 70,
        status: "ACTIVE",
      },
    });
  }

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: patient1.id,
      title: "Appointment Reminder",
      message: "You have an appointment with Dr. Sarah Johnson tomorrow at 10:00 AM.",
      type: "APPOINTMENT",
    },
  });
  await prisma.notification.create({
    data: {
      userId: patient1.id,
      title: "Program Update",
      message: "New module available in Mindfulness Meditation Mastery.",
      type: "PROGRAM",
    },
  });

  // ======== LESSONS for first program (Mindfulness Meditation) ========
  const meditationProgram = allPrograms[0];
  if (meditationProgram) {
    const lessonData = [
      { title: "What is Mindfulness?", description: "Understanding the foundations of mindfulness practice and its benefits for mental health.", order: 1, type: "TEXT", duration: 10,
        content: JSON.stringify({ body: "# What is Mindfulness?\n\nMindfulness is the practice of paying attention to the present moment, without judgment. It involves observing your thoughts, feelings, and sensations as they arise, without trying to change them.\n\n## Key Principles\n\n1. **Present Moment Awareness** - Focus on what's happening right now\n2. **Non-Judgment** - Observe without labeling experiences as good or bad\n3. **Acceptance** - Allow things to be as they are\n4. **Beginner's Mind** - Approach each moment with curiosity\n\n## Benefits\n\n- Reduced stress and anxiety\n- Improved focus and concentration\n- Better emotional regulation\n- Enhanced self-awareness\n- Improved sleep quality\n\n## Getting Started\n\nYou don't need any special equipment or training to begin. Start with just 5 minutes a day, sitting quietly and focusing on your breath." }) },
      { title: "Your First Breath Meditation", description: "A guided 10-minute breath awareness meditation for complete beginners.", order: 2, type: "AUDIO", duration: 10,
        content: JSON.stringify({ instructions: "Find a comfortable seated position. Close your eyes gently. Begin to notice your natural breathing pattern without trying to change it.", steps: ["Settle into position (1 min)", "Notice natural breath (2 min)", "Count breaths 1-10 (3 min)", "Release counting, just observe (3 min)", "Slowly return awareness (1 min)"] }) },
      { title: "Body Scan Practice", description: "Learn the body scan technique to release tension and increase body awareness.", order: 3, type: "EXERCISE", duration: 15,
        content: JSON.stringify({ instructions: "Lie down comfortably. Starting from the top of your head, slowly move your attention through each part of your body.", bodyParts: ["Head & Face", "Neck & Shoulders", "Arms & Hands", "Chest & Upper Back", "Abdomen & Lower Back", "Hips & Pelvis", "Thighs & Knees", "Calves & Feet"], timePerPart: 90 }) },
      { title: "Walking Meditation", description: "Transform your daily walk into a mindfulness practice.", order: 4, type: "VIDEO", duration: 12,
        content: JSON.stringify({ videoDescription: "In this lesson, we explore how to bring mindfulness to movement. Walking meditation is perfect for those who find sitting still challenging.", keyPoints: ["Focus on the sensation of each step", "Notice the contact between foot and ground", "Coordinate breath with steps", "Practice outdoors or indoors"] }) },
      { title: "Mindful Eating Exercise", description: "Practice eating with full awareness and appreciation.", order: 5, type: "EXERCISE", duration: 20,
        content: JSON.stringify({ instructions: "Choose a small piece of food (a raisin works well). We will spend 15 minutes experiencing this food with all our senses.", steps: ["Look at the food closely (2 min)", "Feel its texture (2 min)", "Smell it deeply (2 min)", "Place in mouth without chewing (2 min)", "Chew very slowly (3 min)", "Notice the experience of swallowing (2 min)", "Reflect on the experience (2 min)"] }) },
      { title: "Mindfulness Knowledge Check", description: "Test your understanding of mindfulness concepts.", order: 6, type: "QUIZ", duration: 5,
        content: JSON.stringify({ questions: [
          { q: "What is the primary goal of mindfulness?", options: ["Stopping all thoughts", "Paying attention to the present moment without judgment", "Achieving a state of bliss", "Controlling your emotions"], correct: 1 },
          { q: "Which is NOT a principle of mindfulness?", options: ["Non-judgment", "Present moment awareness", "Perfectionism", "Acceptance"], correct: 2 },
          { q: "How long should beginners meditate?", options: ["At least 1 hour", "30-45 minutes", "Start with 5 minutes and build up", "Only during a full moon"], correct: 2 },
          { q: "What should you do when your mind wanders during meditation?", options: ["Get frustrated and start over", "Gently bring attention back to the breath", "Stop meditating immediately", "Try harder to focus"], correct: 1 },
          { q: "Which is a benefit of regular mindfulness practice?", options: ["Never feeling negative emotions", "Reduced stress and improved focus", "Ability to read minds", "Instant happiness"], correct: 1 },
        ] }) },
    ];

    for (const lesson of lessonData) {
      await prisma.lesson.create({
        data: { ...lesson, programId: meditationProgram.id },
      });
    }
  }

  // ======== GUIDED EXERCISES ========
  const exercises = [
    {
      title: "4-7-8 Breathing",
      description: "A calming breathing technique to reduce anxiety and promote relaxation. Breathe in for 4, hold for 7, exhale for 8.",
      category: "BREATHING",
      duration: 300,
      difficulty: "BEGINNER",
      steps: JSON.stringify([
        { instruction: "Find a comfortable seated position and relax your shoulders.", duration: 10 },
        { instruction: "Exhale completely through your mouth, making a whoosh sound.", duration: 5 },
        { instruction: "Close your mouth. Inhale quietly through your nose for 4 counts.", duration: 4, type: "INHALE" },
        { instruction: "Hold your breath for 7 counts.", duration: 7, type: "HOLD" },
        { instruction: "Exhale completely through your mouth for 8 counts.", duration: 8, type: "EXHALE" },
        { instruction: "This is one cycle. Repeat 3 more times.", duration: 0, type: "REPEAT", repeatFrom: 2, repeatCount: 3 },
        { instruction: "Notice how your body feels. Let your breathing return to normal.", duration: 15 },
      ]),
    },
    {
      title: "Box Breathing",
      description: "Used by Navy SEALs to stay calm under pressure. Equal counts of inhale, hold, exhale, and hold.",
      category: "BREATHING",
      duration: 240,
      difficulty: "BEGINNER",
      steps: JSON.stringify([
        { instruction: "Sit upright with feet flat on the floor. Rest your hands on your lap.", duration: 10 },
        { instruction: "Slowly inhale through your nose for 4 counts.", duration: 4, type: "INHALE" },
        { instruction: "Hold your breath for 4 counts.", duration: 4, type: "HOLD" },
        { instruction: "Exhale slowly through your mouth for 4 counts.", duration: 4, type: "EXHALE" },
        { instruction: "Hold empty for 4 counts.", duration: 4, type: "HOLD" },
        { instruction: "Repeat the cycle 5 more times.", duration: 0, type: "REPEAT", repeatFrom: 1, repeatCount: 5 },
        { instruction: "Return to natural breathing. Notice the calm.", duration: 10 },
      ]),
    },
    {
      title: "5-4-3-2-1 Grounding",
      description: "A sensory awareness exercise that grounds you in the present moment. Perfect for anxiety and panic.",
      category: "GROUNDING",
      duration: 300,
      difficulty: "BEGINNER",
      steps: JSON.stringify([
        { instruction: "Take a deep breath. Look around you.", duration: 10 },
        { instruction: "Name 5 things you can SEE. Look for details — colors, shapes, textures.", duration: 40 },
        { instruction: "Name 4 things you can TOUCH. Feel the texture of your clothes, the chair, the air.", duration: 35 },
        { instruction: "Name 3 things you can HEAR. Listen carefully — distant sounds, nearby sounds.", duration: 30 },
        { instruction: "Name 2 things you can SMELL. Breathe in deeply.", duration: 25 },
        { instruction: "Name 1 thing you can TASTE. Notice the taste in your mouth right now.", duration: 20 },
        { instruction: "Take a final deep breath. You are here. You are present. You are safe.", duration: 15 },
      ]),
    },
    {
      title: "Progressive Muscle Relaxation",
      description: "Systematically tense and release muscle groups to release physical tension and stress.",
      category: "PMR",
      duration: 600,
      difficulty: "BEGINNER",
      steps: JSON.stringify([
        { instruction: "Lie down or sit comfortably. Close your eyes. Take 3 deep breaths.", duration: 20 },
        { instruction: "Tense your FEET — curl your toes tightly. Hold for 5 seconds.", duration: 5, type: "TENSE" },
        { instruction: "Release. Feel the tension melting away from your feet.", duration: 15, type: "RELEASE" },
        { instruction: "Tense your CALVES — point your toes toward your shins. Hold.", duration: 5, type: "TENSE" },
        { instruction: "Release. Notice the difference between tension and relaxation.", duration: 15, type: "RELEASE" },
        { instruction: "Tense your THIGHS — squeeze them tightly. Hold.", duration: 5, type: "TENSE" },
        { instruction: "Release. Feel warmth spreading through your legs.", duration: 15, type: "RELEASE" },
        { instruction: "Tense your ABDOMEN — tighten your stomach muscles. Hold.", duration: 5, type: "TENSE" },
        { instruction: "Release. Let your belly be soft and relaxed.", duration: 15, type: "RELEASE" },
        { instruction: "Tense your HANDS — make tight fists. Hold.", duration: 5, type: "TENSE" },
        { instruction: "Release. Spread your fingers and feel them relax.", duration: 15, type: "RELEASE" },
        { instruction: "Tense your SHOULDERS — raise them to your ears. Hold.", duration: 5, type: "TENSE" },
        { instruction: "Release. Let your shoulders drop completely.", duration: 15, type: "RELEASE" },
        { instruction: "Tense your FACE — scrunch everything tightly. Hold.", duration: 5, type: "TENSE" },
        { instruction: "Release. Smooth your forehead, relax your jaw.", duration: 15, type: "RELEASE" },
        { instruction: "Scan your body. Breathe naturally. Enjoy the feeling of total relaxation.", duration: 30 },
      ]),
    },
    {
      title: "Loving-Kindness Meditation",
      description: "Cultivate feelings of compassion and love toward yourself and others.",
      category: "MEDITATION",
      duration: 600,
      difficulty: "INTERMEDIATE",
      steps: JSON.stringify([
        { instruction: "Sit comfortably. Close your eyes. Take a few deep breaths.", duration: 20 },
        { instruction: "Bring to mind someone you love deeply. Picture them clearly.", duration: 15 },
        { instruction: "Silently repeat: 'May you be happy. May you be healthy. May you be safe. May you live with ease.'", duration: 60 },
        { instruction: "Now direct these wishes toward yourself: 'May I be happy. May I be healthy. May I be safe. May I live with ease.'", duration: 60 },
        { instruction: "Think of a neutral person — someone you neither like nor dislike. Send them the same wishes.", duration: 60 },
        { instruction: "Now think of someone you find difficult. Try to send them these wishes too.", duration: 60 },
        { instruction: "Expand your awareness to include all beings everywhere: 'May all beings be happy. May all beings be safe.'", duration: 60 },
        { instruction: "Rest in this feeling of boundless compassion for a moment.", duration: 30 },
        { instruction: "Gently return your awareness to the room. Open your eyes when ready.", duration: 15 },
      ]),
    },
    {
      title: "Quick Body Scan",
      description: "A 5-minute body awareness exercise to check in with physical sensations.",
      category: "BODY_SCAN",
      duration: 300,
      difficulty: "BEGINNER",
      steps: JSON.stringify([
        { instruction: "Close your eyes. Take 3 deep breaths to settle in.", duration: 15 },
        { instruction: "Bring attention to the top of your head. Notice any sensations.", duration: 20 },
        { instruction: "Move awareness to your face — forehead, eyes, jaw. Release any tension.", duration: 25 },
        { instruction: "Notice your neck and shoulders. Let them soften.", duration: 20 },
        { instruction: "Feel your chest and upper back. Notice the rhythm of your breathing.", duration: 25 },
        { instruction: "Bring awareness to your belly and lower back.", duration: 20 },
        { instruction: "Notice your hips, legs, and feet. Feel grounded.", duration: 25 },
        { instruction: "Now feel your entire body as one. Breathe into any areas of tension.", duration: 30 },
        { instruction: "Take a final deep breath. Open your eyes gently.", duration: 10 },
      ]),
    },
  ];

  for (const exercise of exercises) {
    await prisma.guidedExercise.create({ data: exercise });
  }

  // ======== GROUP SESSIONS ========
  const nextMonday = new Date(now);
  nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
  nextMonday.setHours(18, 0, 0, 0);

  const nextWednesday = new Date(now);
  nextWednesday.setDate(nextWednesday.getDate() + ((3 + 7 - nextWednesday.getDay()) % 7 || 7));
  nextWednesday.setHours(19, 0, 0, 0);

  const nextSaturday = new Date(now);
  nextSaturday.setDate(nextSaturday.getDate() + ((6 + 7 - nextSaturday.getDay()) % 7 || 7));
  nextSaturday.setHours(10, 0, 0, 0);

  await prisma.groupSession.create({
    data: {
      title: "Anxiety Support Circle",
      description: "A safe, supportive space to share experiences with anxiety and learn coping strategies together. Led by Dr. Sarah Johnson.",
      hostId: therapist1.id,
      category: "SUPPORT_GROUP",
      dateTime: nextMonday,
      duration: 60,
      maxParticipants: 12,
      price: 0,
      isRecurring: true,
      recurrence: "WEEKLY",
      tags: JSON.stringify(["anxiety", "support", "coping"]),
    },
  });

  await prisma.groupSession.create({
    data: {
      title: "Mindful Movement Workshop",
      description: "Combine gentle yoga with mindfulness techniques. No experience needed. Focus on the mind-body connection.",
      hostId: therapist2.id,
      category: "WORKSHOP",
      dateTime: nextWednesday,
      duration: 75,
      maxParticipants: 20,
      price: 15,
      isRecurring: true,
      recurrence: "WEEKLY",
      tags: JSON.stringify(["yoga", "mindfulness", "movement"]),
    },
  });

  await prisma.groupSession.create({
    data: {
      title: "Saturday Morning Meditation",
      description: "Start your weekend with a guided group meditation session. Perfect for beginners and experienced practitioners alike.",
      hostId: therapist4.id,
      category: "MEDITATION_CIRCLE",
      dateTime: nextSaturday,
      duration: 45,
      maxParticipants: 30,
      price: 0,
      isRecurring: true,
      recurrence: "WEEKLY",
      tags: JSON.stringify(["meditation", "weekend", "relaxation"]),
    },
  });

  await prisma.groupSession.create({
    data: {
      title: "Stress Management for Professionals",
      description: "Learn evidence-based techniques for managing workplace stress. Interactive workshop with practical tools you can use immediately.",
      hostId: therapist3.id,
      category: "WEBINAR",
      dateTime: new Date(nextWednesday.getTime() + 7 * 24 * 60 * 60 * 1000),
      duration: 90,
      maxParticipants: 50,
      price: 25,
      isRecurring: false,
      tags: JSON.stringify(["stress", "workplace", "professional"]),
    },
  });

  // ======== SAMPLE JOURNAL ENTRY ========
  await prisma.journalEntry.create({
    data: {
      userId: patient1.id,
      mood: 7,
      energy: 6,
      anxiety: 4,
      sleep: 7,
      gratitude: "Grateful for a good conversation with my friend today.",
      highlight: "Completed my morning meditation without getting distracted.",
      challenge: "Work deadline causing some stress, but I managed it better than usual.",
      freeWrite: "Today was a mixed day. The morning started well — I did my meditation and felt centered. Work got intense in the afternoon but I used the breathing techniques from my program. Feeling proud of the progress.",
      tags: JSON.stringify(["meditation", "work", "progress"]),
    },
  });

  console.log("Database seeded successfully!");
  console.log("\nTest Accounts:");
  console.log("  Admin:     admin@nishmawellness.com / password123");
  console.log("  Therapist: dr.sarah@nishmawellness.com / password123");
  console.log("  Patient:   patient@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
