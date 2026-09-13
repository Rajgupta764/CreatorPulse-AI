"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function Cta() {
  const { ref, inView } = useScrollReveal();

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div
          ref={ref}
            className={`rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/[0.03] p-8 sm:p-12 reveal-self ${inView ? "visible" : ""}`}
          style={{ transitionDelay: "150ms" }}
        >
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Try It Before You Sign Up
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Paste any title and get a full AI-powered analysis — patterns, psychology scores, power words, and actionable next steps. No account needed.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/generate"
              className="btn btn-secondary px-7 py-3"
            >
              <BarChart3 className="h-4 w-4" />
              Title Analyzer Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
