"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function FeatureCard() {
  const { ref, inView } = useScrollReveal({ threshold: 0.2 });

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div
        ref={ref}
        className={`mx-auto max-w-7xl rounded-2xl bg-gradient-to-br from-primary/5 to-primary/[0.02] p-8 sm:p-12 lg:p-16 reveal-up ${inView ? "visible" : ""}`}
      >
        <div className="grid items-center gap-10 sm:grid-cols-2 sm:gap-14">
          <div>
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
                <li key={i} className={`flex items-start gap-3 text-sm text-muted-foreground reveal-left ${inView ? "visible" : ""}`} style={{ transitionDelay: `${400 + i * 150}ms` }}>
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={`flex justify-center reveal-right ${inView ? "visible" : ""}`} style={{ transitionDelay: "300ms" }}>
            <div className="relative overflow-hidden rounded-xl">
              <Image
                src="/images/Feature Section.png"
                alt="CreatorPulse AI feature showcase"
                width={560}
                height={420}
                className="h-auto w-full max-w-[500px] object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
