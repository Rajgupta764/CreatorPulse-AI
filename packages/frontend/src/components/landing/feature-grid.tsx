"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const tools = [
  { title: "Title Analyzer", desc: "Viral DNA & psychology scores" },
  { title: "Title Battle", desc: "Head-to-head comparison" },
  { title: "Hook Lab", desc: "30-sec opening scripts" },
  { title: "Idea Validator", desc: "6-dimension scoring" },
  { title: "Launch Command", desc: "Pre-upload readiness" },
  { title: "Audience Compass", desc: "Comment intelligence" },
];

export default function FeatureGrid() {
  const { ref: headingRef, inView: headingInView } = useScrollReveal({ threshold: 0.2 });
  const { ref: gridRef, inView: gridInView } = useScrollReveal({ threshold: 0.05 });

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div
          ref={headingRef}
          className={`mx-auto max-w-2xl text-center reveal-up ${headingInView ? "visible" : ""}`}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Nine interconnected tools that form a complete content strategy OS.
          </p>
        </div>

        <div
          ref={gridRef}
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6"
        >
          <div
            className={`reveal-up col-span-2 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-primary/[0.02] sm:col-span-1 sm:row-span-2 ${gridInView ? "visible" : ""}`}
            style={{ transitionDelay: "100ms" }}
          >
            <div className="flex h-full flex-col justify-between p-6">
              <div>
                <h3 className="text-xl font-semibold">Explore Tools</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tools.length} powerful tools to optimize every part of your content workflow.
                </p>
              </div>
              <div className="mt-4">
                <Image
                  src="/images/Feature Sections.png"
                  alt="CreatorPulse AI tools overview"
                  width={400}
                  height={300}
                  className="h-auto w-full rounded-lg object-contain"
                />
              </div>
            </div>
          </div>

          {tools.map((tool, i) => (
            <div
              key={tool.title}
              className={`reveal rounded-xl border border-border bg-card p-5 sm:p-6 ${gridInView ? "visible" : ""}`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <h3 className="text-sm font-semibold sm:text-base">{tool.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {tool.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
