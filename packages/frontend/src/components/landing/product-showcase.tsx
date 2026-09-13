"use client";

import { useState } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import LaptopMockup from "./laptop-mockup";

const slides = [
  {
    key: "analyze",
    label: "Analyze",
    title: "Paste any title and run an instant AI analysis.",
    src: "/images/screenshots/analyzer-main.png",
    width: 1901,
    height: 1017,
  },
  {
    key: "scores",
    label: "Scores",
    title: "Get viral DNA, psychology scores and patterns at a glance.",
    src: "/images/screenshots/analyzer-scores.png",
    width: 1900,
    height: 1075,
  },
  {
    key: "power",
    label: "Enrich",
    title: "See power words, enrichment ideas and actionable next steps.",
    src: "/images/screenshots/analyzer-power.png",
    width: 1899,
    height: 1058,
  },
];

export default function ProductShowcase() {
  const { ref, inView } = useScrollReveal({ threshold: 0.15 });
  const [active, setActive] = useState(0);
  const slide = slides[active];

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div
          ref={ref}
          className={`mx-auto max-w-xl text-center reveal-up ${inView ? "visible" : ""}`}
        >
          <div className="mb-2 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Product Tour
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            See CreatorPulse AI in Action
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Three steps from a raw title to AI-powered confidence.
          </p>
        </div>

        <div
          className={`mt-10 reveal-up ${inView ? "visible" : ""}`}
          style={{ transitionDelay: "150ms" }}
        >
          <LaptopMockup
            key={slide.key}
            src={slide.src}
            alt={slide.title}
            url="creatorpulse.ai/generate"
            width={slide.width}
            height={slide.height}
            className="mx-auto w-full max-w-[640px]"
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <div className="inline-flex rounded-full border border-border bg-card p-1">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  i === active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <p key={slide.key} className="mx-auto mt-4 max-w-md text-center text-sm text-muted-foreground animate-fade-in">
          {slide.title}
        </p>
      </div>
    </section>
  );
}