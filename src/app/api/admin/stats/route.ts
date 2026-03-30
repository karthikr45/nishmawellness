import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalUsers, totalTherapists, totalPatients, totalAppointments, totalPrograms, totalEnrollments, recentAppointments] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "THERAPIST" } }),
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.appointment.count(),
    prisma.program.count(),
    prisma.enrollment.count(),
    prisma.appointment.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { name: true } },
        therapist: { select: { name: true } },
      },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalTherapists,
    totalPatients,
    totalAppointments,
    totalPrograms,
    totalEnrollments,
    recentAppointments,
  });
}
