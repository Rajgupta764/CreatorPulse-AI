"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Star, Quote } from "lucide-react";

export default function TestimonialCard() {
  const { ref, inView } = useScrollReveal({ threshold: 0.15 });

  return (
    <section className="section-spacing page-container">
      <div
        ref={ref}
        className={`mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border bg-card reveal-up ${inView ? "visible" : ""}`}
      >
        <div className="grid items-center gap-0 sm:grid-cols-2">
          <div className="p-8 sm:p-10 lg:p-14">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Star className="h-3 w-3 fill-primary" />
              Featured Review
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Trusted by Creators
            </h2>
            <div className="mt-4 flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="mt-4 text-base leading-relaxed text-foreground/90">
              &ldquo;CreatorPulse AI completely changed how I approach my titles. The psychology
              scores alone helped me double my CTR in two weeks. It&apos;s like having a
              data scientist on your team.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/60 to-primary/30 text-sm font-bold text-primary-foreground">
                RK
              </div>
              <div>
                <p className="text-sm font-semibold">Raj Kumar</p>
                <p className="text-xs text-muted-foreground">YouTube Creator</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center bg-gradient-to-br from-primary/[0.03] to-transparent p-8 sm:p-10">
            <Image
              src="/images/Testimonial.png"
              alt="Creator using CreatorPulse AI"
              width={440}
              height={360}
              className="h-auto w-full max-w-[380px] rounded-xl object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
