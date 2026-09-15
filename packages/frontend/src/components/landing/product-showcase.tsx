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
    <section className="section-spacing page-container">
      <div className="mx-auto max-w-5xl">
        <div
          ref={ref}
          className={`mx-auto max-w-xl text-center reveal-up ${inView ? "visible" : ""}`}
        >
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            Product Tour
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
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
            className="mx-auto w-full max-w-[620px]"
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
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
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
