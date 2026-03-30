"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Leaf, LayoutDashboard, Calendar, MessageSquare, Brain,
  BookOpen, BarChart3, Users, Settings, LogOut, Menu, X,
  Video, ClipboardList, Bell, FileText, UserPlus, Star,
  Award, Building2, PenLine, Wind, Heart,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const patientNav: NavItem[] = [
  { label: "Dashboard", href: "/patient", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Appointments", href: "/patient/appointments", icon: <Calendar className="w-5 h-5" /> },
  { label: "AI Wellness Chat", href: "/patient/ai-chat", icon: <Brain className="w-5 h-5" /> },
  { label: "Programs", href: "/patient/programs", icon: <BookOpen className="w-5 h-5" /> },
  { label: "Messages", href: "/patient/messages", icon: <MessageSquare className="w-5 h-5" /> },
  { label: "My Progress", href: "/patient/progress", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Journal", href: "/patient/journal", icon: <PenLine className="w-5 h-5" /> },
  { label: "Assessments", href: "/patient/assessments", icon: <ClipboardList className="w-5 h-5" /> },
  { label: "Exercises", href: "/patient/exercises", icon: <Wind className="w-5 h-5" /> },
  { label: "Group Sessions", href: "/patient/groups", icon: <Heart className="w-5 h-5" /> },
  { label: "Video Sessions", href: "/patient/video", icon: <Video className="w-5 h-5" /> },
  { label: "Profile", href: "/patient/profile", icon: <Settings className="w-5 h-5" /> },
];

const therapistNav: NavItem[] = [
  { label: "Dashboard", href: "/therapist", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Appointments", href: "/therapist/appointments", icon: <Calendar className="w-5 h-5" /> },
  { label: "My Patients", href: "/therapist/patients", icon: <Users className="w-5 h-5" /> },
  { label: "Patient Brief", href: "/therapist/patient-brief", icon: <FileText className="w-5 h-5" /> },
  { label: "Session Notes", href: "/therapist/notes", icon: <FileText className="w-5 h-5" /> },
  { label: "Messages", href: "/therapist/messages", icon: <MessageSquare className="w-5 h-5" /> },
  { label: "Availability", href: "/therapist/availability", icon: <ClipboardList className="w-5 h-5" /> },
  { label: "Reviews", href: "/therapist/reviews", icon: <Star className="w-5 h-5" /> },
  { label: "AI TwinClone", href: "/therapist/twinclone", icon: <Brain className="w-5 h-5" /> },
  { label: "Continuity Score", href: "/therapist/continuity", icon: <Award className="w-5 h-5" /> },
  { label: "Profile", href: "/therapist/profile", icon: <Settings className="w-5 h-5" /> },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
  { label: "Therapists", href: "/admin/therapists", icon: <UserPlus className="w-5 h-5" /> },
  { label: "Programs", href: "/admin/programs", icon: <BookOpen className="w-5 h-5" /> },
  { label: "Appointments", href: "/admin/appointments", icon: <Calendar className="w-5 h-5" /> },
  { label: "Organizations", href: "/admin/organizations", icon: <Building2 className="w-5 h-5" /> },
  { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Notifications", href: "/admin/notifications", icon: <Bell className="w-5 h-5" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
];

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = session?.user.role === "THERAPIST"
    ? therapistNav
    : session?.user.role === "ADMIN"
    ? adminNav
    : patientNav;

  const isActive = (href: string) => {
    if (href === "/patient" || href === "/therapist" || href === "/admin") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const sidebar = (
    <div className={`flex flex-col h-full bg-white border-r ${collapsed ? "w-16" : "w-64"} transition-all duration-300`}>
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Nishma</span>
          </Link>
        )}
        <button
          onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
          className="p-1.5 hover:bg-gray-100 rounded-lg"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5 md:hidden" />}
          {!collapsed && <Menu className="w-5 h-5 hidden md:block" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href)
                ? "bg-primary-50 text-primary-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className={isActive(item.href) ? "text-primary-600" : ""}>{item.icon}</span>
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`flex items-center ${collapsed ? "justify-center" : ""} w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block h-screen sticky top-0">{sidebar}</div>
    </>
  );
}
