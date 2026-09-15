"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api-client";
import {
  BarChart3, Swords, Lightbulb, ClipboardCheck, Rocket,
  MessageSquare, Map, Shuffle, LayoutDashboard, CreditCard,
  Menu, X, LogIn, UserPlus, ChevronDown, Sparkles, Clock,
} from "lucide-react";

const tools = [
  { href: "/generate", label: "Title Analyzer", desc: "Viral DNA & psychology scores", icon: BarChart3 },
  { href: "/battle", label: "Title Battle", desc: "Head-to-head comparison", icon: Swords },
  { href: "/hook", label: "Hook Lab", desc: "30-sec opening scripts", icon: Lightbulb },
  { href: "/validate", label: "Idea Validator", desc: "6-dimension scoring", icon: ClipboardCheck },
  { href: "/readiness", label: "Launch Command", desc: "Pre-upload readiness", icon: Rocket },
  { href: "/comments", label: "Audience Compass", desc: "Comment intelligence", icon: MessageSquare },
  { href: "/content-gap", label: "Opportunity Map", desc: "Competitor gap analysis", icon: Map },
  { href: "/repurpose", label: "Content Atomizer", desc: "Cross-platform adapt", icon: Shuffle },
  { href: "/dashboard", label: "Command Center", desc: "Stats, streaks & insights", icon: LayoutDashboard },
];

const navLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

export default function Nav() {
  const pathname = usePathname();
  const isOnToolPage = tools.some((t) => pathname === t.href);
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ tier: string; used: number; limit: number; remaining: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFeaturesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!token) { setUsage(null); return; }
    apiFetch("/api/usage")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setUsage(d))
      .catch(() => setUsage(null));
  }, [token, pathname]);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
          <img src="/logo.png" alt="CreatorPulse" style={{ height: '32px', width: 'auto' }} />
          <span className="sr-only">CreatorPulse AI</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => {
              if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
              setFeaturesOpen(true);
            }}
            onMouseLeave={() => {
              closeTimeoutRef.current = setTimeout(() => setFeaturesOpen(false), 250);
            }}
          >
            <button
              onClick={() => setFeaturesOpen(!featuresOpen)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isOnToolPage
                  ? "text-primary bg-primary/6"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Features
              {isOnToolPage && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${featuresOpen ? "rotate-180" : ""}`} />
            </button>

            {featuresOpen && (
              <div className="absolute left-1/2 top-full mt-2 w-160 -translate-x-1/2 rounded-xl border border-border bg-card shadow-xl animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-3 gap-1 p-3">
                  {tools.map((tool) => {
                    const isActive = pathname === tool.href;
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setFeaturesOpen(false)}
                        className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${
                          isActive ? "bg-secondary" : "hover:bg-secondary"
                        }`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isActive ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
                        }`}>
                          <tool.icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{tool.label}</p>
                          <p className="truncate text-xs text-muted-foreground">{tool.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {token ? (
            <>
              <Link
                href="/dashboard"
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>

              <Link
                href="/history"
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === "/history"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Clock className="h-4 w-4" />
                History
              </Link>

              {usage && usage.tier === "free" && (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/8 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/12"
                >
                  {usage.remaining} left
                </Link>
              )}
              {usage && usage.tier === "pro" && (
                <Link
                  href="/billing/settings"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#6FA56F]/10 px-3 py-1.5 text-xs font-medium text-[#6FA56F] hover:bg-[#6FA56F]/20 transition-colors"
                >
                  Pro
                </Link>
              )}

              <Link
                href="/logout"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
              >
                Sign Out
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn btn-secondary rounded-lg px-4 py-2 text-muted-foreground"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn btn-primary rounded-lg px-5 py-2"
              >
                <UserPlus className="h-4 w-4" />
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-secondary md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border px-4 pb-5 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {tools.map((tool) => {
              const isActive = pathname === tool.href;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <tool.icon className="h-4.5 w-4.5 text-primary" />
                  {tool.label}
                </Link>
              );
            })}
            <hr className="my-2 border-border" />
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <hr className="my-2 border-border" />
            {token ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname === "/dashboard"
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <LayoutDashboard className="h-4.5 w-4.5 text-primary" />
                  Dashboard
                </Link>
                <Link
                  href="/history"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname === "/history"
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Clock className="h-4.5 w-4.5 text-primary" />
                  History
                </Link>
                <Link
                  href="/billing/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  <CreditCard className="h-4.5 w-4.5 text-primary" />
                  Billing
                  {usage && usage.tier === "pro" && (
                    <span className="ml-auto rounded bg-[#6FA56F]/10 px-2 py-0.5 text-xs font-medium text-[#6FA56F]">Pro</span>
                  )}
                  {usage && usage.tier === "free" && (
                    <span className="ml-auto text-xs text-primary">{usage.remaining} left</span>
                  )}
                </Link>
                <Link
                  href="/logout"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  Sign Out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  <LogIn className="h-4.5 w-4.5" />
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 flex items-center justify-center rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
