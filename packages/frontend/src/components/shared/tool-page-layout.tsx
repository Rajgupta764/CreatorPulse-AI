"use client";

import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface Step {
  num: number;
  title: string;
  desc: string;
}

interface ToolPageLayoutProps {
  title: string;
  description: string;
  icon: LucideIcon;
  steps: Step[];
  image?: string;
  children: React.ReactNode;
}

function StepCard({ step, delay }: { step: Step; delay: number }) {
  const { ref, inView } = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <div
      ref={ref}
      className={`reveal-up flex flex-1 items-start gap-3 rounded-xl border border-border bg-card p-4 sm:flex-col sm:p-5 ${inView ? "visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        {step.num}
      </span>
      <div>
        <p className="text-sm font-semibold sm:text-base">{step.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {step.desc}
        </p>
      </div>
    </div>
  );
}

export default function ToolPageLayout({
  title,
  description,
  icon: Icon,
  steps,
  image,
  children,
}: ToolPageLayoutProps) {
  const { ref: headerRef, inView: headerInView } = useScrollReveal({ threshold: 0.2 });

  return (
    <main>
      <section className="bg-gradient-to-b from-primary/[0.03] to-transparent px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div
            ref={headerRef}
            className={`grid items-center gap-6 sm:grid-cols-2 sm:gap-10 ${headerInView ? "visible" : ""}`}
          >
            <div className={`reveal-up flex flex-col items-center text-center sm:items-start sm:text-left ${headerInView ? "visible" : ""}`}>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-16 sm:w-16">
                  <Icon className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
                </div>
                <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>
            {image && (
              <div className={`reveal-right flex justify-center ${headerInView ? "visible" : ""}`} style={{ transitionDelay: "200ms" }}>
                <Image
                  src={image}
                  alt={`${title} illustration`}
                  width={400}
                  height={300}
                  className="h-auto w-full max-w-[360px] animate-float-gentle rounded-lg object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground sm:text-left">
            How It Works
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            {steps.map((step, i) => (
              <StepCard key={step.num} step={step} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-fade-in">{children}</div>
      </section>
    </main>
  );
}
