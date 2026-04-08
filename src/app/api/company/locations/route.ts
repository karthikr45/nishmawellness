import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const location = await prisma.orgLocation.create({
    data: {
      organizationId: body.organizationId,
      name: body.name,
      type: body.type || "OFFICE",
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      country: body.country || null,
    },
  });
  return NextResponse.json(location);
}
