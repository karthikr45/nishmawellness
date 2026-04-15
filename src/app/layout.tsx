import type { Metadata } from "next";
import { SessionProvider } from "@/components/providers/session-provider";
import ToastProvider from "@/components/providers/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nishma Wellness - Holistic Health & Therapy Platform",
  description:
    "Connect with licensed therapists, access AI-powered wellness support, and join transformative training programs for your mental and physical well-being.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-square.png",
    apple: "/logo-square.png",
    shortcut: "/logo-square.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nishma Wellness",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-square.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-[#fafaff] dark:bg-[#0f0e1a]">
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
