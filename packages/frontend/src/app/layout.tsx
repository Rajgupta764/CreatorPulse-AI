import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/shared/nav";
import BackToTop from "@/components/shared/back-to-top";
import TitleSetter from "@/components/shared/title-setter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://creatorpulse.ai"),
  title: "CreatorPulse AI — Research Intelligence for YouTube Creators",
  description: "Research Intelligence Platform for YouTube creators. Analyze, battle, and optimize your video titles with data-driven insights.",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
  openGraph: {
    title: "CreatorPulse AI — Research Intelligence for YouTube Creators",
    description: "Analyze, battle, and optimize your YouTube titles with AI-powered insights.",
    siteName: "CreatorPulse AI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CreatorPulse AI — Research Intelligence for YouTube Creators",
    description: "Analyze, battle, and optimize your YouTube titles with AI-powered insights.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Nav />
        {children}
        <BackToTop />
        <TitleSetter />
      </body>
    </html>
  );
}
