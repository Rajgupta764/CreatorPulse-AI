"use client";

import Link from "next/link";
import {
  BarChart3, Swords, Lightbulb, ClipboardCheck, Rocket,
  Mail, Globe, Phone,
} from "lucide-react";

const productLinks = [
  { href: "/generate", label: "Title Analyzer", icon: BarChart3 },
  { href: "/battle", label: "Title Battle", icon: Swords },
  { href: "/hook", label: "Hook Lab", icon: Lightbulb },
  { href: "/validate", label: "Idea Validator", icon: ClipboardCheck },
  { href: "/readiness", label: "Launch Command", icon: Rocket },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const contactLinks = [
  { href: "mailto:imraj.engineer@gmail.com", label: "imraj.engineer@gmail.com", icon: Mail },
  { href: "https://www.linkedin.com/in/raj-kumar-cse/", label: "LinkedIn", icon: Globe },
  { href: "https://www.rajcodes.me", label: "rajcodes.me", icon: Globe },
  { href: "tel:7645848488", label: "7645848488", icon: Phone },
  { href: "https://instagram.com/rajify.g", label: "rajify.g", icon: Globe },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-10">
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
              <img src="/logo.png" alt="CreatorPulse" style={{ height: '32px', width: 'auto' }} />
              <span className="sr-only">CreatorPulse AI</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Research Intelligence for YouTube Creators.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Product
            </p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Company
            </p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Legal
            </p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Connect
            </p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {contactLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-5 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} CreatorPulse AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
