import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const division = await prisma.orgDivision.create({
    data: { locationId: body.locationId, name: body.name, head: body.head || null },
  });
  return NextResponse.json(division);
}
