import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes - no auth needed
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/programs",
    "/book",
    "/ai-chat",
    "/privacy",
    "/terms",
    "/blog",
    "/about",
    "/contact",
    "/faq",
    "/forgot-password",
    "/reset-password",
    "/onboarding",
    "/onboarding/corporate",
  ];

  const isPublic = publicPaths.some((p) => pathname === p) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/programs") && req.method === "GET" ||
    pathname.startsWith("/api/users/therapists") && req.method === "GET" ||
    pathname.startsWith("/api/exercises") && req.method === "GET" ||
    pathname.startsWith("/api/group-sessions") && req.method === "GET" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname.includes(".");

  if (isPublic) {
    return NextResponse.next();
  }

  const session = await auth();

  // Not logged in - redirect to login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  // Role-based route protection
  if (pathname.startsWith("/patient") && role !== "PATIENT" && role !== "ADMIN") {
    return NextResponse.redirect(new URL(`/${role?.toLowerCase() || "login"}`, req.url));
  }

  if (pathname.startsWith("/therapist") && role !== "THERAPIST" && role !== "ADMIN") {
    return NextResponse.redirect(new URL(`/${role?.toLowerCase() || "login"}`, req.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL(`/${role?.toLowerCase() || "login"}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
