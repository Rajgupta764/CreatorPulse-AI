"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const testimonials = [
  { name: "Sarah Chen", role: "Tech YouTuber", text: "The battle feature alone is worth it. I can A/B test title ideas before I even record." },
  { name: "Marcus Williams", role: "Gaming Creator", text: "My viewer retention rate jumped 40% after using the Hook Lab. Absolute game-changer." },
  { name: "Priya Sharma", role: "Education Channel", text: "Finally, a tool that understands YouTube psychology. The readiness score keeps me from publishing duds." },
];

export default function TestimonialsGrid() {
  const { ref: headingRef, inView: headingInView } = useScrollReveal({ threshold: 0.2 });
  const { ref: gridRef, inView: gridInView } = useScrollReveal({ threshold: 0.05 });

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div
          ref={headingRef}
          className={`mx-auto max-w-xl text-center reveal-up ${headingInView ? "visible" : ""}`}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by Creators
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Join thousands of creators who use CreatorPulse AI daily.
          </p>
        </div>

        <div className="grid items-center gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              ref={gridRef}
              className={`reveal-up mt-8 rounded-xl border border-border bg-card p-6 ${gridInView ? "visible" : ""}`}
              style={{ transitionDelay: `${200 + i * 150}ms` }}
            >
              <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/40 to-primary/20" />
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
          <div
            className={`reveal-up mt-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/5 to-primary/[0.02] p-6 sm:col-span-2 lg:col-span-1 ${gridInView ? "visible" : ""}`}
            style={{ transitionDelay: "500ms" }}
          >
            <Image
              src="/images/testimonaials.png"
              alt="More testimonials"
              width={300}
              height={240}
              className="h-auto w-full max-w-[260px] rounded-lg object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
