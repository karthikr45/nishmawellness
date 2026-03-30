import Link from "next/link";
import { Leaf, Heart, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Nishma Wellness</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your holistic wellness companion. Connecting you with licensed therapists,
              AI-powered support, and transformative programs.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/book" className="hover:text-primary-400 transition-colors">Therapy Sessions</Link></li>
              <li><Link href="/ai-chat" className="hover:text-primary-400 transition-colors">AI Wellness Chat</Link></li>
              <li><Link href="/programs" className="hover:text-primary-400 transition-colors">Training Programs</Link></li>
              <li><Link href="/programs" className="hover:text-primary-400 transition-colors">Meditation & Yoga</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link href="/#therapists" className="hover:text-primary-400 transition-colors">Our Therapists</Link></li>
              <li><Link href="/#testimonials" className="hover:text-primary-400 transition-colors">Testimonials</Link></li>
              <li><Link href="/register?role=therapist" className="hover:text-primary-400 transition-colors">Join as Therapist</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>hello@nishmawellness.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-sm">
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} Nishma Wellness. All rights reserved.
          </p>
          <p className="flex items-center mt-2 md:mt-0 text-gray-500">
            Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> for your well-being
          </p>
        </div>
      </div>
    </footer>
  );
}
