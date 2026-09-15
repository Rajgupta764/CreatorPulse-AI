"use client";

import Link from "next/link";
import { Sparkles, TrendingUp, Zap } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import LaptopMockup, { MiniBrowserCard } from "./laptop-mockup";

export default function HeroSection() {
  const { ref: textRef, inView: textInView } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const { ref: imgRef, inView: imgInView } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="section-spacing page-container">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-8 sm:grid-cols-2 sm:gap-12 lg:gap-16">
          <div ref={textRef} className="max-w-xl">
            <div className={`reveal-up ${textInView ? "visible" : ""}`} style={{ transitionDelay: "0ms" }}>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
                Turn Your YouTube Titles Into
                <span className="mt-1 block text-primary">Viral Goldmines</span>
              </h1>
            </div>
            <div className={`reveal-up ${textInView ? "visible" : ""}`} style={{ transitionDelay: "150ms" }}>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                Stop guessing what works. Paste any title and get real metrics, psychology scores,
                and AI-powered insights in seconds — no sign-up required.
              </p>
            </div>
            <div className={`reveal-up ${textInView ? "visible" : ""}`} style={{ transitionDelay: "300ms" }}>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/generate" className="btn btn-primary rounded-lg px-6 py-3 text-base">
                  Analyze a Title
                </Link>
                <Link href="/pricing" className="btn btn-secondary rounded-lg px-6 py-3 text-base">
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
          <div
            ref={imgRef}
            className={`reveal-right flex justify-center ${imgInView ? "visible" : ""}`}
          >
            <div className="relative w-full max-w-[580px]">
              <div
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1),transparent_65%)]"
                aria-hidden
              />
              <div
                className="absolute -top-6 left-0 z-0 hidden w-[40%] rotate-[-6deg] animate-float-gentle sm:block"
                style={{ animationDuration: "6s" }}
              >
                <MiniBrowserCard
                  src="/images/screenshots/analyzer-scores.png"
                  alt="Psychology scores"
                  url="creatorpulse.ai/generate"
                  width={1900}
                  height={1075}
                />
              </div>
              <div
                className="absolute -bottom-8 right-0 z-0 hidden w-[38%] rotate-[5deg] animate-float-gentle sm:block"
                style={{ animationDuration: "7s", animationDelay: "1.2s" }}
              >
                <MiniBrowserCard
                  src="/images/screenshots/analyzer-power.png"
                  alt="Power words"
                  url="creatorpulse.ai/generate"
                  width={1899}
                  height={1058}
                />
              </div>

              <LaptopMockup
                src="/images/screenshots/analyzer-main.png"
                alt="CreatorPulse AI Title Analyzer"
                url="creatorpulse.ai/generate"
                width={1901}
                height={1017}
                priority
                className="relative z-10 mx-auto w-full max-w-[520px]"
              />

              <div
                className="absolute -left-2 top-[8%] z-20 animate-float-gentle lg:-left-8"
                style={{ animationDuration: "5s" }}
              >
                <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 shadow-lg backdrop-blur">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <div className="text-[10px] leading-tight">
                    <p className="font-semibold text-foreground">87</p>
                    <p className="text-muted-foreground">Virality</p>
                  </div>
                </div>
              </div>
              <div
                className="absolute -right-2 top-[34%] z-20 animate-float-gentle lg:-right-8"
                style={{ animationDuration: "5.6s", animationDelay: "0.7s" }}
              >
                <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 shadow-lg backdrop-blur">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <div className="text-[10px] leading-tight">
                    <p className="font-semibold text-foreground">+40%</p>
                    <p className="text-muted-foreground">CTR uplift</p>
                  </div>
                </div>
              </div>
              <div
                className="absolute bottom-[12%] left-[2%] z-20 animate-float-gentle lg:-left-2"
                style={{ animationDuration: "6.2s", animationDelay: "1.4s" }}
              >
                <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 shadow-lg backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <div className="text-[10px] leading-tight">
                    <p className="font-semibold text-foreground">5 found</p>
                    <p className="text-muted-foreground">Power words</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
