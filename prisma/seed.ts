import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
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
