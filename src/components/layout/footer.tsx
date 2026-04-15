import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUpRight, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gray-950 text-gray-400 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-primary-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-secondary-600/5 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Top section — CTA strip */}
        <div className="py-12 border-b border-gray-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Ready to transform well-being?
              </h3>
              <p className="text-gray-500 mt-1">Start free. No credit card required.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/register"
                className="px-6 py-3 gradient-bg text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center">
                Get Started <ArrowUpRight className="w-4 h-4 ml-2" />
              </Link>
              <Link href="/company-signup"
                className="px-6 py-3 border border-gray-700 text-gray-300 rounded-xl font-semibold text-sm hover:border-gray-500 hover:text-white transition-all">
                For Companies
              </Link>
            </div>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3">
            <div className="mb-5">
              <img src="/logo.png" alt="Nishma Wellness" className="w-[240px] object-contain" />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              AI-powered wellness platform that remembers your journey.
              Therapy, exercises, and support — all in one place.
            </p>
            <div className="flex items-center space-x-4 mt-6">
              {["X", "in", "ig", "yt"].map((social) => (
                <div key={social}
                  className="w-9 h-9 border border-gray-800 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 transition-all cursor-pointer text-xs font-bold">
                  {social}
                </div>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-5">Platform</h4>
            <ul className="space-y-3">
              {[
                { label: "AI Therapy", href: "/ai-chat" },
                { label: "Video Sessions", href: "/book" },
                { label: "Programs", href: "/programs" },
                { label: "AI Avatar", href: "/register" },
                { label: "TwinClone AI", href: "/register" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Business */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-5">For Business</h4>
            <ul className="space-y-3">
              {[
                { label: "Corporate Wellness", href: "/company-signup" },
                { label: "Burnout Prediction", href: "/company-signup" },
                { label: "HR Dashboard", href: "/company-signup" },
                { label: "Team Leaderboard", href: "/company-signup" },
                { label: "Join Your Company", href: "/join-company" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Students */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-5">For Students</h4>
            <ul className="space-y-3">
              {[
                { label: "Student Signup", href: "/student-signup" },
                { label: "Career Explorer", href: "/register" },
                { label: "Interview Prep", href: "/register" },
                { label: "Campus Plans", href: "/join-campus" },
                { label: "Academic Wellness", href: "/register" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Contact */}
          <div className="col-span-2 md:col-span-2">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-5">Company</h4>
            <ul className="space-y-3 mb-6">
              {[
                { label: "How It Works", href: "/how-it-works" },
                { label: "Pricing", href: "/pricing" },
                { label: "About", href: "/#about" },
                { label: "Blog", href: "/blog" },
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-5">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2.5 text-sm">
                <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>hello@nishmawellness.com</span>
              </li>
              <li className="flex items-center space-x-2.5 text-sm">
                <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2.5 text-sm">
                <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-8 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-x-3 gap-y-1 text-xs text-gray-600">
              <p>&copy; {new Date().getFullYear()} Nishma Wellness. All rights reserved.</p>
              <span className="hidden md:inline text-gray-700">&middot;</span>
              <p>Founded by <span className="text-gray-400 font-medium">Sesha Sai Nishma Kurapati</span> &amp; <span className="text-gray-400 font-medium">Karthik Reddycharla</span></p>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-gray-600">
              <span>Powered by</span>
              <span className="font-bold text-gray-400 flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-primary-500" />
                MK Tech Monk
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
