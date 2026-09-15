"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function Cta() {
  const { ref, inView } = useScrollReveal();

  return (
    <section className="section-spacing page-container">
      <div className="mx-auto max-w-4xl">
        <div
          ref={ref}
          className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/[0.06] p-8 sm:p-12 lg:p-16 reveal-up ${inView ? "visible" : ""}`}
        >
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.08),transparent_50%)]" />
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              No Account Required
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Try It Before You Sign Up
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              Paste any title and get a full AI-powered analysis — patterns, psychology scores,
              power words, and actionable next steps. Zero commitment.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/generate"
                className="btn btn-primary inline-flex items-center gap-2 rounded-lg px-7 py-3 text-sm font-medium"
              >
                <BarChart3 className="h-4 w-4" />
                Analyze a Title Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="btn btn-secondary rounded-lg px-7 py-3 text-sm font-medium"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
