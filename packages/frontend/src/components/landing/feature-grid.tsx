"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  BarChart3, Swords, Lightbulb, ClipboardCheck, Rocket,
  MessageSquare,
} from "lucide-react";

const tools = [
  { title: "Title Analyzer", desc: "Viral DNA & psychology scores", icon: BarChart3, featured: true },
  { title: "Title Battle", desc: "Head-to-head comparison", icon: Swords },
  { title: "Hook Lab", desc: "30-sec opening scripts", icon: Lightbulb },
  { title: "Idea Validator", desc: "6-dimension scoring", icon: ClipboardCheck },
  { title: "Launch Command", desc: "Pre-upload readiness", icon: Rocket },
  { title: "Audience Compass", desc: "Comment intelligence", icon: MessageSquare },
];

export default function FeatureGrid() {
  const { ref: headingRef, inView: headingInView } = useScrollReveal({ threshold: 0.2 });
  const { ref: gridRef, inView: gridInView } = useScrollReveal({ threshold: 0.05 });

  return (
    <section className="section-spacing page-container">
      <div className="mx-auto max-w-7xl">
        <div
          ref={headingRef}
          className={`mx-auto max-w-2xl text-center reveal-up ${headingInView ? "visible" : ""}`}
        >
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            All-in-One Platform
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Nine interconnected tools that form a complete content strategy OS.
          </p>
        </div>

        <div
          ref={gridRef}
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
        >
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.title}
                className={`group relative rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-[0_4px_20px_rgba(245,158,11,0.06)] ${tool.featured ? "sm:col-span-2 sm:row-span-2 sm:p-8 lg:col-span-1 lg:row-span-1" : ""} ${gridInView ? "visible" : ""}`}
                style={{ transitionDelay: `${100 + i * 80}ms` }}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15 ${gridInView ? "reveal visible" : "reveal"}`} style={{ transitionDelay: `${200 + i * 80}ms` }}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{tool.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {tool.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
