"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function TestimonialCard() {
  const { ref, inView } = useScrollReveal({ threshold: 0.2 });

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div
        ref={ref}
        className={`mx-auto max-w-5xl rounded-2xl bg-gradient-to-br from-[#241E19] to-[#3E362E] p-8 sm:p-12 reveal-up ${inView ? "visible" : ""}`}
      >
        <div className="grid items-center gap-8 sm:grid-cols-2 sm:gap-12">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#51473D] bg-[#F59E0B]/10 px-3 py-1 text-xs font-medium text-[#F59E0B]">
              Testimonial
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Trusted by Creators
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              &ldquo;CreatorPulse AI completely changed how I approach my titles. The psychology
              scores alone helped me double my CTR in two weeks. It&apos;s like having a
              data scientist on your team.&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60" />
              <div>
                <p className="text-sm font-semibold">Raj Kumar</p>
                <p className="text-xs text-muted-foreground">YouTube Creator</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <Image
                src="/images/Testimonial.png"
                alt="Testimonial illustration"
                width={440}
                height={360}
                className="h-auto w-full max-w-[400px] animate-float-gentle rounded-lg object-contain"
                style={{ animationDuration: "5s" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
