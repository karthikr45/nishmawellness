"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard, ArrowRight } from "lucide-react";
import Logo from "@/components/ui/logo";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!session) return "/login";
    switch (session.user.role) {
      case "ORG_ADMIN": return "/company";
      case "HR_MANAGER": return "/hr";
      case "THERAPIST": return "/therapist";
      case "ADMIN": return "/admin";
      default: return "/patient";
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm"
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Nishma Wellness" className="w-[240px] object-contain" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { label: "Platform", href: "/programs" },
              { label: "For Companies", href: "/company-signup" },
              { label: "For Students", href: "/student-signup" },
              { label: "Pricing", href: "/programs" },
              { label: "Blog", href: "/blog" },
            ].map((link) => (
              <Link key={link.label} href={link.href}
                className={`px-4 py-2 text-[13px] font-semibold transition-colors rounded-lg ${
                  scrolled
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {session ? (
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{session.user.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border dark:border-gray-800 py-2 z-50">
                    <Link href={getDashboardLink()}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setProfileOpen(false)}>
                      <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
                    </Link>
                    <Link href={`${getDashboardLink()}/profile`}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setProfileOpen(false)}>
                      <User className="w-4 h-4 mr-3" /> Profile
                    </Link>
                    <hr className="my-2 dark:border-gray-800" />
                    <button onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                      <LogOut className="w-4 h-4 mr-3" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login"
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/80 hover:text-white"
                  }`}>
                  Sign In
                </Link>
                <Link href="/register"
                  className="px-5 py-2.5 gradient-bg text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/25 flex items-center">
                  Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-t dark:border-gray-800">
          <div className="px-6 py-6 space-y-1">
            {[
              { label: "Platform", href: "/programs" },
              { label: "For Companies", href: "/company-signup" },
              { label: "For Students", href: "/student-signup" },
              { label: "Pricing", href: "/programs" },
              { label: "Blog", href: "/blog" },
            ].map((link) => (
              <Link key={link.label} href={link.href}
                className="block py-3 text-gray-700 dark:text-gray-300 font-semibold text-base"
                onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <hr className="my-3 dark:border-gray-800" />
            {session ? (
              <>
                <Link href={getDashboardLink()} className="block py-3 text-gray-700 dark:text-gray-300 font-semibold" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="block py-3 text-red-600 font-semibold">Sign Out</button>
              </>
            ) : (
              <div className="flex space-x-3 pt-3">
                <Link href="/login" className="flex-1 text-center py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl">Sign In</Link>
                <Link href="/register" className="flex-1 text-center py-3 gradient-bg text-white font-semibold rounded-xl">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
