"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Leaf, ChevronDown, LogOut, User, LayoutDashboard } from "lucide-react";
import Button from "@/components/ui/button";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const getDashboardLink = () => {
    if (!session) return "/login";
    switch (session.user.role) {
      case "THERAPIST": return "/therapist";
      case "ADMIN": return "/admin";
      default: return "/patient";
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Nishma Wellness</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/programs" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Programs
            </Link>
            <Link href="/book" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Book Session
            </Link>
            <Link href="/ai-chat" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              AI Wellness
            </Link>
            <Link href="/#about" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              About
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{session.user.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-1 z-50">
                    <Link
                      href={getDashboardLink()}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                    </Link>
                    <Link
                      href={`${getDashboardLink()}/profile`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" /> Profile
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <Link href="/programs" className="block py-2 text-gray-600 font-medium" onClick={() => setMobileOpen(false)}>Programs</Link>
            <Link href="/book" className="block py-2 text-gray-600 font-medium" onClick={() => setMobileOpen(false)}>Book Session</Link>
            <Link href="/ai-chat" className="block py-2 text-gray-600 font-medium" onClick={() => setMobileOpen(false)}>AI Wellness</Link>
            <hr />
            {session ? (
              <>
                <Link href={getDashboardLink()} className="block py-2 text-gray-600 font-medium" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="block py-2 text-red-600 font-medium">Sign Out</button>
              </>
            ) : (
              <div className="flex space-x-3 pt-2">
                <Link href="/login" className="flex-1"><Button variant="outline" className="w-full">Sign In</Button></Link>
                <Link href="/register" className="flex-1"><Button variant="primary" className="w-full">Get Started</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
