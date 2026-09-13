"use client";

import Link from "next/link";
import {
  BarChart3, Swords, Lightbulb, ClipboardCheck, Rocket,
  MessageSquare, Map, Shuffle, LayoutDashboard,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const features = [
  { href: "/generate", icon: BarChart3, title: "Title Analyzer", desc: "Viral DNA, psychology scores & AI enrichment" },
  { href: "/battle", icon: Swords, title: "Title Battle", desc: "Head-to-head with hybrid suggestions" },
  { href: "/hook", icon: Lightbulb, title: "Hook Lab", desc: "3 opening scripts in different styles" },
  { href: "/validate", icon: ClipboardCheck, title: "Idea Validator", desc: "6-dimension scoring with evolution" },
  { href: "/readiness", icon: Rocket, title: "Launch Command", desc: "Pre-upload readiness + checklist" },
  { href: "/comments", icon: MessageSquare, title: "Audience Compass", desc: "Comment mining + video ideas" },
  { href: "/content-gap", icon: Map, title: "Opportunity Map", desc: "Competitor gap analysis" },
  { href: "/repurpose", icon: Shuffle, title: "Content Atomizer", desc: "Adapt for TikTok, IG, X, LinkedIn" },
  { href: "/dashboard", icon: LayoutDashboard, title: "Command Center", desc: "Stats, streaks & cross-feature insights" },
];

export default function Features() {
  const { ref: headingRef, inView: headingInView } = useScrollReveal();
  const { ref: gridRef, inView: gridInView } = useScrollReveal({ threshold: 0.05 });

  return (
    <section className="px-4 pt-12 pb-8 sm:pt-14 sm:pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div
          ref={headingRef}
          className={`mx-auto max-w-xl text-center reveal-self ${headingInView ? "visible" : ""}`}
        >
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Everything You Need in One Place
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Nine interconnected tools that form a complete content strategy OS.
          </p>
        </div>

        <div
          ref={gridRef}
          className={`mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 ${gridInView ? "reveal-active" : ""}`}
        >
          {features.map((f, i) => (
            <Link
              key={f.href}
              href={f.href}
              className={`feature-card ${i % 2 === 0 ? "from-left" : "from-right"} group rounded-xl border border-border bg-card p-0 transition-all hover:border-primary/30 hover:shadow-md`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div
                className="feature-inner p-4 sm:p-5"
                style={{ animationDelay: `${i * 120 + 1200}ms` }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 sm:h-10 sm:w-10">
                  <f.icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold sm:text-base">{f.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {f.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
