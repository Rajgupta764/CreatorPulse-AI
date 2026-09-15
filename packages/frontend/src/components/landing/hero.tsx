"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import RobotMascot from "./robot-mascot";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function Hero() {
  const { ref: leftRef, inView: leftInView } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const { ref: rightRef, inView: rightInView } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const heroRef = useRef<HTMLElement>(null);
  const robotWrapRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const scrollYRef = useRef(0);
  const timeRef = useRef(0);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const idleStrengthRef = useRef(1);
  const glowPosRef = useRef({ x: 50, y: 50 });

  useEffect(() => {
    const handleScroll = () => { scrollYRef.current = window.scrollY; };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let raf: number;
    const animate = () => {
      timeRef.current += 0.016;
      const dx = targetRef.current.x - currentRef.current.x;
      const dy = targetRef.current.y - currentRef.current.y;
      currentRef.current.x += dx * 0.12;
      currentRef.current.y += dy * 0.12;

      const isMoving = Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01;
      if (isMoving) {
        idleStrengthRef.current += (0 - idleStrengthRef.current) * 0.05;
      } else {
        idleStrengthRef.current += (1 - idleStrengthRef.current) * 0.02;
      }

      const floatOffset = Math.sin(timeRef.current * 2.5) * 8 * idleStrengthRef.current;
      const tiltX = currentRef.current.x;
      const tiltY = currentRef.current.y;
      const scale = 1 + (1 - idleStrengthRef.current) * 0.03;

      if (robotWrapRef.current) {
        robotWrapRef.current.style.transform =
          `rotateX(${tiltY}deg) rotateY(${tiltX}deg) scale(${scale}) translateY(${scrollYRef.current * 0.08 + floatOffset}px)`;
      }

      const gx = 50 + (targetRef.current.x / 30) * 30;
      const gy = 50 + (targetRef.current.y / -20) * 30;
      glowPosRef.current.x += (gx - glowPosRef.current.x) * 0.08;
      glowPosRef.current.y += (gy - glowPosRef.current.y) * 0.08;

      if (glowRef.current) {
        glowRef.current.style.background =
          `radial-gradient(ellipse 80px 120px at ${glowPosRef.current.x}% ${glowPosRef.current.y}%, rgba(245,158,11,0.15), transparent 70%)`;
      }

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleMouseMove(e: React.MouseEvent) {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    targetRef.current = { x: x * 25, y: y * -18 };

    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseLeave() {
    targetRef.current = { x: 0, y: 0 };
  }

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden px-4 pb-12 pt-4 sm:px-6 sm:pt-6 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-125 w-125 rounded-full bg-linear-to-br from-primary/15 to-brand-light/10 blur-[100px] animate-float" />
        <div className="absolute -bottom-32 -right-32 h-100 w-100 rounded-full bg-linear-to-br from-brand-light/15 to-chart-2/10 blur-[80px] animate-float-slow" />
        <div className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-linear-to-tr from-primary/5 to-transparent blur-[60px] animate-float" style={{ animationDelay: "2s", animationDuration: "14s" }} />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-8 sm:grid-cols-2 sm:gap-12 lg:gap-16">
          <div
            ref={leftRef}
            className={`${leftInView ? "reveal-active" : ""}`}
          >
            <div className={`reveal-item from-up ${leftInView ? "opacity-100 translate-y-0" : ""}`} style={{ transitionDelay: "0ms" }}>
              <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Research Intelligence for YouTube Creators
              </div>
            </div>

            <div className={`reveal-item from-up ${leftInView ? "opacity-100 translate-y-0" : ""}`} style={{ transitionDelay: "100ms" }}>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Turn Your YouTube Titles Into
                <span className="mt-2 block bg-linear-to-r from-primary via-brand-light to-chart-2 bg-clip-text text-transparent animate-shimmer">
                  Viral Goldmines
                </span>
              </h1>
            </div>

            <div className={`reveal-item from-up ${leftInView ? "opacity-100 translate-y-0" : ""}`} style={{ transitionDelay: "200ms" }}>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                Stop guessing what works. Paste any title and get real metrics, psychology scores,
                and AI-powered insights in seconds — no sign-up required.
              </p>
            </div>
          </div>

          <div
            ref={rightRef}
            className={`flex justify-center reveal-self-right ${rightInView ? "visible" : ""}`}
            style={{ perspective: "800px" }}
          >
            <div className="relative">
              <div
                ref={glowRef}
                className="pointer-events-none absolute inset-0 z-10"
              />
              <div
                ref={robotWrapRef}
                style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
              >
                <RobotMascot className="relative h-auto w-full max-w-50 object-contain sm:max-w-75 lg:max-w-90" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
