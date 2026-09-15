"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Check } from "lucide-react";

export default function FeatureCard() {
  const { ref, inView } = useScrollReveal({ threshold: 0.15 });

  return (
    <section className="section-spacing page-container">
      <div
        ref={ref}
        className={`mx-auto max-w-7xl overflow-hidden rounded-2xl border border-border bg-card reveal-up ${inView ? "visible" : ""}`}
      >
        <div className="grid items-center gap-8 sm:grid-cols-2 sm:gap-0">
          <div className="p-8 sm:p-10 lg:p-14">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              Core Feature
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI-Powered Title Analysis
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Every title gets dissected across 7 psychology dimensions, scored for virality,
              and enriched with AI-generated insights — all in under 2 seconds.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {[
                "Real metrics — character count, readability, power words",
                "Deep psychology — curiosity, authority, emotion, urgency",
                "Personal context — compare against your history & niche",
              ].map((item, i) => (
                <li key={i} className={`flex items-start gap-3 text-sm text-muted-foreground reveal-left ${inView ? "visible" : ""}`} style={{ transitionDelay: `${300 + i * 100}ms` }}>
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={`flex justify-center bg-gradient-to-br from-primary/[0.03] to-transparent p-8 sm:p-10 reveal-right ${inView ? "visible" : ""}`} style={{ transitionDelay: "200ms" }}>
            <Image
              src="/images/Feature Section.png"
              alt="CreatorPulse AI feature showcase"
              width={560}
              height={420}
              className="h-auto w-full max-w-[460px] rounded-xl object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
