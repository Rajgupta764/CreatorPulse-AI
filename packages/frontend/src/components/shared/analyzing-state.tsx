"use client";

import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";

const defaultPhases = [
  "Scanning title structure...",
  "Analyzing psychology dimensions...",
  "Scoring virality quotient...",
  "Crafting your playbook...",
];

interface AnalyzingStateProps {
  icon: LucideIcon;
  phases?: string[];
}

export default function AnalyzingState({ icon: Icon, phases = defaultPhases }: AnalyzingStateProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % phases.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [phases.length]);

  return (
    <div className="mt-8 animate-fade-in-up">
      <div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-card p-8 text-center sm:p-10">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <div className="absolute inset-[-4px] rounded-full border border-primary/20" />
          <div className="absolute inset-[-4px] rounded-full border border-primary/10 animate-ring-pulse" />
          <Icon className="h-7 w-7 text-primary" />
        </div>

        <div className="relative flex items-center gap-1.5">
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-sm font-medium text-muted-foreground transition-opacity duration-300" key={phaseIndex}>
            {phases[phaseIndex]}
          </p>
        </div>

          <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-full animate-pulse rounded-full bg-primary/30" />
          </div>
      </div>
    </div>
  );
}
