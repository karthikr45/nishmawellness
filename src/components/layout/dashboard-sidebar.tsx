"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LanguageSelector from "@/components/shared/language-selector";
import { useSession, signOut } from "next-auth/react";
import {
  Leaf, LayoutDashboard, Calendar, MessageSquare, Brain,
  BookOpen, BarChart3, Users, Settings, LogOut, Menu, X,
  Video, ClipboardList, Bell, FileText, UserPlus, Star,
  Award, Building2, PenLine, Wind, Heart, CreditCard, DollarSign,
  Eye, Sun, Moon, Clock, TrendingUp, Lock, MapPin,
  Target, Send, Shield, AlertTriangle, Briefcase,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  section?: string; // Group header
}

const patientNav: NavItem[] = [
  { label: "Home", href: "/patient", icon: <LayoutDashboard className="w-5 h-5" /> },
  // Therapy
  { label: "Therapy", href: "", icon: <></>, section: "THERAPY" },
  { label: "Book Session", href: "/patient/appointments", icon: <Calendar className="w-5 h-5" /> },
  { label: "AI Chat", href: "/patient/ai-chat", icon: <Brain className="w-5 h-5" /> },
  // AI Avatar hidden during pilot — responses are mocked. Re-enable when D-ID/ElevenLabs are wired.
  // { label: "AI Avatar", href: "/patient/avatar-session", icon: <Sparkles className="w-5 h-5" /> },
  { label: "TwinClone", href: "/patient/twinclone", icon: <Users className="w-5 h-5" /> },
  { label: "Messages", href: "/patient/messages", icon: <MessageSquare className="w-5 h-5" /> },
  // Wellness
  { label: "Wellness", href: "", icon: <></>, section: "WELLNESS" },
  { label: "Programs", href: "/patient/programs", icon: <BookOpen className="w-5 h-5" /> },
  { label: "Exercises", href: "/patient/exercises", icon: <Wind className="w-5 h-5" /> },
  { label: "Journal", href: "/patient/journal", icon: <PenLine className="w-5 h-5" /> },
  { label: "Sleep & Sounds", href: "/patient/sleep", icon: <Moon className="w-5 h-5" /> },
  { label: "Focus Timer", href: "/patient/focus", icon: <Clock className="w-5 h-5" /> },
  // Progress
  { label: "Progress", href: "", icon: <></>, section: "PROGRESS" },
  { label: "Insights", href: "/patient/insights", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Assessments", href: "/patient/assessments", icon: <ClipboardList className="w-5 h-5" /> },
  { label: "Achievements", href: "/patient/achievements", icon: <Award className="w-5 h-5" /> },
  // Career & Student
  { label: "Career", href: "", icon: <></>, section: "CAREER" },
  { label: "Career Explorer", href: "/patient/career", icon: <Target className="w-5 h-5" /> },
  { label: "Interview Prep", href: "/patient/interview-prep", icon: <Briefcase className="w-5 h-5" /> },
  { label: "Academic Tools", href: "/patient/academic", icon: <BookOpen className="w-5 h-5" /> },
  // Community
  { label: "Connect", href: "", icon: <></>, section: "CONNECT" },
  { label: "Groups", href: "/patient/groups", icon: <Heart className="w-5 h-5" /> },
  { label: "Community", href: "/patient/community", icon: <Users className="w-5 h-5" /> },
  { label: "Family", href: "/patient/family", icon: <Heart className="w-5 h-5" /> },
  // Settings
  { label: "Settings", href: "", icon: <></>, section: "SETTINGS" },
  { label: "Profile", href: "/patient/profile", icon: <Settings className="w-5 h-5" /> },
  { label: "Billing", href: "/patient/billing", icon: <CreditCard className="w-5 h-5" /> },
  { label: "Privacy", href: "/patient/data-privacy", icon: <Lock className="w-5 h-5" /> },
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
  { label: "TwinClone Studio", href: "/therapist/twinclone", icon: <Brain className="w-5 h-5" /> },
  { label: "Clone Oversight", href: "/therapist/twinclone-reviews", icon: <Eye className="w-5 h-5" /> },
  { label: "Continuity Score", href: "/therapist/continuity", icon: <Award className="w-5 h-5" /> },
  { label: "Earnings", href: "/therapist/earnings", icon: <DollarSign className="w-5 h-5" /> },
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
  { label: "Blog", href: "/admin/blog", icon: <FileText className="w-5 h-5" /> },
  { label: "Moderation", href: "/admin/moderation", icon: <Eye className="w-5 h-5" /> },
  { label: "Notifications", href: "/admin/notifications", icon: <Bell className="w-5 h-5" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
];

// Company Admin sees ONLY company management
const orgAdminNav: NavItem[] = [
  { label: "Dashboard", href: "/company", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Locations", href: "/company/locations", icon: <MapPin className="w-5 h-5" /> },
  { label: "Employees", href: "/company/employees", icon: <Users className="w-5 h-5" /> },
  { label: "Wellness Heatmap", href: "/company/heatmap", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Burnout Prediction", href: "/hr", icon: <AlertTriangle className="w-5 h-5" /> },
  { label: "Incidents", href: "/company/incidents", icon: <Shield className="w-5 h-5" /> },
  { label: "Leaderboard", href: "/company/leaderboard", icon: <Award className="w-5 h-5" /> },
  { label: "Recognition Wall", href: "/company/recognition", icon: <Heart className="w-5 h-5" /> },
  { label: "Challenges", href: "/company/challenges", icon: <Target className="w-5 h-5" /> },
  { label: "Manager Toolkit", href: "/company/manager-toolkit", icon: <BookOpen className="w-5 h-5" /> },
  { label: "Feedback", href: "/company/feedback", icon: <MessageSquare className="w-5 h-5" /> },
  { label: "Surveys", href: "/company/surveys", icon: <ClipboardList className="w-5 h-5" /> },
  { label: "Settings", href: "/company/settings", icon: <Settings className="w-5 h-5" /> },
];

// HR Manager sees analytics only
const hrManagerNav: NavItem[] = [
  { label: "Dashboard", href: "/hr", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Analytics", href: "/hr", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Pulse Surveys", href: "/hr", icon: <ClipboardList className="w-5 h-5" /> },
  { label: "Feedback", href: "/hr", icon: <MessageSquare className="w-5 h-5" /> },
  { label: "Wellness Reports", href: "/hr", icon: <FileText className="w-5 h-5" /> },
];

function DarkModeToggle({ collapsed }: { collapsed: boolean }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("nishma-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(saved === "dark" || (!saved && prefersDark));
  }, []);
  const toggle = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("nishma-theme", newDark ? "dark" : "light");
  };
  return (
    <button onClick={toggle}
      className={`flex items-center ${collapsed ? "justify-center" : ""} w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}>
      {dark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
      {!collapsed && <span className="ml-3">{dark ? "Light Mode" : "Dark Mode"}</span>}
    </button>
  );
}

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Determine which nav to show based on session role (set at login time)
  const getNavItems = (): NavItem[] => {
    const role = session?.user?.role;
    switch (role) {
      case "ORG_ADMIN": return orgAdminNav;
      case "HR_MANAGER": return hrManagerNav;
      case "THERAPIST": return therapistNav;
      case "ADMIN": return adminNav;
      default: return patientNav;
    }
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    if (href === "/patient" || href === "/therapist" || href === "/admin" || href === "/company" || href === "/hr") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const sidebar = (
    <div className={`flex flex-col h-full bg-white dark:bg-[#12112a] border-r border-[#eeecf5] dark:border-[#2a2845] ${collapsed ? "w-16" : "w-64"} transition-all duration-300`}>
      <div className="flex items-center justify-between p-4">
        {!collapsed ? (
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Nishma"
              width={180}
              height={120}
              className="w-[180px] h-auto object-contain"
              priority
            />
          </Link>
        ) : (
          <Link href="/">
            <Image
              src="/logo-square.png"
              alt="Nishma"
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl object-cover"
            />
          </Link>
        )}
        <button
          onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
          className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-950 rounded-lg text-gray-400"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5 md:hidden" />}
          {!collapsed && <Menu className="w-5 h-5 hidden md:block" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2.5 space-y-0.5">
        {navItems.map((item) => {
          // Section header
          if (item.section) {
            if (collapsed) return null;
            return (
              <div key={item.section} className="pt-6 pb-1.5 px-3 first:pt-1">
                <p className="text-[10px] font-semibold text-gray-300 dark:text-gray-600 uppercase tracking-[0.15em]">{item.section}</p>
              </div>
            );
          }
          return (
          <Link
            key={item.href + item.label}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
              isActive(item.href)
                ? "bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300"
                : "text-gray-500 dark:text-gray-400 hover:bg-[#f5f3ff] dark:hover:bg-[#1e1d3a] hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span className={`${isActive(item.href) ? "text-primary-600 dark:text-primary-400" : "text-gray-400"}`}>{item.icon}</span>
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`flex items-center ${collapsed ? "justify-center" : ""} w-full px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/50 transition-colors`}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}

      <div className="hidden md:block h-screen sticky top-0">{sidebar}</div>
    </>
  );
}
