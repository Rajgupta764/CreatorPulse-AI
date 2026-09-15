"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Tech YouTuber",
    channel: "Tech with Sarah",
    text: "The battle feature alone is worth it. I can A/B test title ideas before I even record. My click-through rate jumped 35% in just two weeks.",
    rating: 5,
  },
  {
    name: "Marcus Williams",
    role: "Gaming Creator",
    channel: "MarcusPlayz",
    text: "My viewer retention rate jumped 40% after using the Hook Lab. It completely changed how I approach my video openings. Absolute game-changer.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Education Channel",
    channel: "Learn with Priya",
    text: "Finally, a tool that understands YouTube psychology. The readiness score keeps me from publishing duds. It's like having a data scientist on your team.",
    rating: 5,
  },
];

export default function TestimonialsGrid() {
  const { ref: headingRef, inView: headingInView } = useScrollReveal({ threshold: 0.2 });
  const { ref: gridRef, inView: gridInView } = useScrollReveal({ threshold: 0.05 });
  const { ref: imageRef, inView: imageInView } = useScrollReveal({ threshold: 0.2 });

  return (
    <section className="section-spacing page-container">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div
          ref={headingRef}
          className={`mx-auto max-w-2xl text-center reveal-up ${headingInView ? "visible" : ""}`}
        >
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Star className="h-3 w-3 fill-primary" />
            Testimonials
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Loved by Creators
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Join thousands of creators who use CreatorPulse AI daily to optimize their content strategy.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div
          ref={gridRef}
          className={`mt-12 grid gap-6 lg:grid-cols-3 reveal-up ${gridInView ? "visible" : ""}`}
        >
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`group relative rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(245,158,11,0.08)] sm:p-8 ${gridInView ? "visible" : ""}`}
              style={{ transitionDelay: `${150 + i * 120}ms` }}
            >
              {/* Quote icon */}
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Quote className="h-5 w-5 text-primary" />
              </div>

              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-base leading-relaxed text-foreground/90">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/60 to-primary/30 text-sm font-bold text-primary-foreground">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.channel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Creator Image Section */}
        <div
          ref={imageRef}
          className={`mt-16 reveal-up ${imageInView ? "visible" : ""}`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border">
            <Image
              src="/images/testimonaials.png"
              alt="Creator using CreatorPulse AI to optimize their YouTube content"
              width={1200}
              height={600}
              className="h-auto w-full object-cover"
              style={{ maxHeight: '420px' }}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <p className="text-sm font-medium text-foreground/90 sm:text-base">
                Built for creators who take their craft seriously.
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Analyze, optimize, and grow — all from one dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
