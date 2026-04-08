import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Critical Incident Management
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const incidents = await prisma.criticalIncident.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const stats = {
    total: incidents.length,
    new: incidents.filter((i) => i.status === "NEW").length,
    critical: incidents.filter((i) => i.severity === "CRITICAL").length,
    resolved: incidents.filter((i) => i.status === "RESOLVED").length,
  };

  return NextResponse.json({ incidents, stats });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status, actionsTaken, assignedTo } = await req.json();

  const incident = await prisma.criticalIncident.update({
    where: { id },
    data: {
      status,
      ...(actionsTaken && { actionsTaken: JSON.stringify(actionsTaken) }),
      ...(assignedTo && { assignedTo }),
      ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
    },
  });

  return NextResponse.json(incident);
}
