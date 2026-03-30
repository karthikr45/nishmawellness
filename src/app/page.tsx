import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  Brain, Calendar, Video, BookOpen, Shield, Heart,
  Star, ArrowRight, CheckCircle, Sparkles, Users, Clock,
} from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI TwinClone Therapy",
    description: "Chat with an AI version of your therapist between sessions. Available 24/7 for support and guidance.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: "Video Sessions",
    description: "Face-to-face therapy from the comfort of your home with licensed professionals.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Training Programs",
    description: "Structured wellness programs in yoga, meditation, fitness, nutrition, and mental health.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Easy Scheduling",
    description: "Book appointments instantly with real-time availability. Flexible rescheduling options.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Private & Secure",
    description: "HIPAA-compliant platform with end-to-end encryption for all your sessions and data.",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Holistic Approach",
    description: "Integrated care combining therapy, nutrition, fitness, and mindfulness practices.",
    color: "bg-pink-100 text-pink-600",
  },
];

const therapists = [
  {
    name: "Dr. Sarah Johnson",
    specialty: "Clinical Psychology, CBT",
    experience: "15 years",
    rating: 4.9,
  },
  {
    name: "Dr. Michael Chen",
    specialty: "Integrative Psychiatry",
    experience: "12 years",
    rating: 4.8,
  },
  {
    name: "Dr. Emily Rivera",
    specialty: "Family Therapy, Trauma",
    experience: "10 years",
    rating: 4.9,
  },
  {
    name: "Dr. James Patel",
    specialty: "Sports Psychology",
    experience: "8 years",
    rating: 4.7,
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    text: "The AI TwinClone feature is incredible. Having access to support between sessions has been a game-changer for my anxiety management.",
    rating: 5,
  },
  {
    name: "David K.",
    text: "The meditation program combined with regular therapy sessions has helped me find a balance I never thought possible.",
    rating: 5,
  },
  {
    name: "Lisa R.",
    text: "Booking sessions is so easy, and the video quality is excellent. My therapist is wonderful and the platform makes it all seamless.",
    rating: 5,
  },
];

const stats = [
  { value: "10,000+", label: "Active Members" },
  { value: "200+", label: "Licensed Therapists" },
  { value: "50,000+", label: "Sessions Completed" },
  { value: "4.9/5", label: "Average Rating" },
];

export default function HomePage() {
  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-200 rounded-full blur-3xl opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto pt-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Wellness Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your Path to
              <span className="gradient-text"> Holistic </span>
              Wellness
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with licensed therapists, access AI-powered support 24/7,
              and join transformative training programs for your mental and physical well-being.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/register">
                <Button size="lg" variant="primary" className="text-base">
                  Start Your Journey <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/ai-chat">
                <Button size="lg" variant="outline" className="text-base">
                  <Brain className="w-5 h-5 mr-2" /> Try AI Wellness Chat
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for <span className="gradient-text">Wellness</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform combining therapy, AI support, and holistic programs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} hover className="p-8">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How <span className="gradient-text">Nishma</span> Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Your Profile", desc: "Sign up and tell us about your wellness goals. Get matched with the right therapist.", icon: <Users className="w-8 h-8" /> },
              { step: "02", title: "Book or Chat", desc: "Schedule video sessions with therapists or start an AI wellness chat instantly.", icon: <Calendar className="w-8 h-8" /> },
              { step: "03", title: "Transform & Track", desc: "Follow personalized programs, track progress, and achieve your wellness goals.", icon: <Heart className="w-8 h-8" /> },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-primary-600 mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Therapists */}
      <section id="therapists" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our <span className="gradient-text">Expert Therapists</span>
            </h2>
            <p className="text-lg text-gray-600">Licensed professionals dedicated to your well-being</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {therapists.map((therapist) => (
              <Card key={therapist.name} hover className="p-6 text-center">
                <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {therapist.name.split(" ").map(n => n[0]).join("")}
                </div>
                <h3 className="font-semibold text-gray-900">{therapist.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{therapist.specialty}</p>
                <div className="flex items-center justify-center mt-3 space-x-3 text-sm">
                  <span className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current mr-1" /> {therapist.rating}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" /> {therapist.experience}
                  </span>
                </div>
                <Link href="/book" className="block mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    Book Session
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI TwinClone Feature */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 bg-secondary-100 rounded-full text-secondary-700 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 mr-1" /> Powered by AI
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Meet Your AI <span className="gradient-text">TwinClone</span> Therapist
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our revolutionary TwinClone AI creates a digital twin of your therapist,
                available 24/7 for support between sessions. Get personalized guidance
                that matches your therapist&apos;s approach and style.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Available 24/7 for immediate support",
                  "Learns from your therapist's approach",
                  "Provides coping strategies in real-time",
                  "Seamlessly bridges between live sessions",
                  "Complete privacy and confidentiality",
                ].map((item) => (
                  <li key={item} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/ai-chat">
                <Button size="lg">
                  <Brain className="w-5 h-5 mr-2" /> Try AI Chat Now
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-auto">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b">
                  <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">AI TwinClone</p>
                    <p className="text-xs text-green-500">Online</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="chat-bubble-ai bg-gray-100 p-3 max-w-[85%]">
                    <p className="text-sm text-gray-700">Hello! How are you feeling today? I&apos;m here to help you work through anything on your mind.</p>
                  </div>
                  <div className="chat-bubble-user bg-primary-600 text-white p-3 max-w-[85%] ml-auto">
                    <p className="text-sm">I&apos;ve been feeling anxious about work lately.</p>
                  </div>
                  <div className="chat-bubble-ai bg-gray-100 p-3 max-w-[85%]">
                    <p className="text-sm text-gray-700">I understand. Let&apos;s try a quick grounding exercise together. Can you name 5 things you can see right now?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our <span className="gradient-text">Members Say</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-8">
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-medium">
                    {t.name[0]}
                  </div>
                  <p className="ml-3 font-medium text-gray-900">{t.name}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gradient-bg rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white animate-float" />
              <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white animate-float" style={{ animationDelay: "3s" }} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Life?</h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Join Nishma Wellness today and take the first step towards a healthier, happier you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100 shadow-none">
                    Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/programs">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Browse Programs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
