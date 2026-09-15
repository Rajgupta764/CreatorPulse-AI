"use client";

import type { LucideIcon } from "lucide-react";

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
  children: React.ReactNode;
}

export default function ToolPageLayout({
  title,
  description,
  icon: Icon,
  steps,
  children,
}: ToolPageLayoutProps) {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Compact Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
        </div>

        {/* How It Works — compact inline */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex flex-1 items-start gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {step.num}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tool Workspace */}
        <div className="mt-6 animate-fade-in">
          {children}
        </div>
      </div>
    </main>
  );
}
