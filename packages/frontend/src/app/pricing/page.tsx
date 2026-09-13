"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out CreatorPulse AI and analyzing your first few titles.",
    tier: "free",
    features: [
      "3 analyses per day",
      "Basic virality score & patterns",
      "Power words & psychology dimensions",
      "Next Move suggestion",
      "Guest access (no login required)",
    ],
    cta: { label: "Get Started", href: "/generate" },
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For serious creators who want data-driven title optimization every day.",
    tier: "pro",
    features: [
      "Unlimited analyses (100/day)",
      "Full psychology breakdown",
      "Generate 3 AI alternatives",
      "Test titles in Battle mode",
      "Save history & track progress",
      "Export results (PDF coming soon)",
      "Priority AI queue (faster results)",
      "7-day free trial, cancel anytime",
    ],
    cta: { label: "Start Free Trial", href: "#" },
    highlighted: true,
  },
];

const comparisonRows = [
  { feature: "Analyses per day", free: "3", pro: "Unlimited (100/day)" },
  { feature: "Virality score", free: true, pro: true },
  { feature: "Patterns & power words", free: true, pro: true },
  { feature: "Psychology dimensions", free: "Basic", pro: "Full" },
  { feature: "Next Move suggestion", free: true, pro: true },
  { feature: "Generate 3 alternatives", free: false, pro: true },
  { feature: "Title Battle mode", free: false, pro: true },
  { feature: "Save & view history", free: false, pro: true },
  { feature: "Export results", free: false, pro: "Coming soon" },
  { feature: "Priority AI queue", free: false, pro: true },
  { feature: "Cancel anytime", free: true, pro: true },
];

export default function PricingPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
  }, []);

  return (
    <main className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            Start for free. Upgrade when you&apos;re ready to go deeper with unlimited
            analyses, history, and AI-powered alternatives.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 sm:items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 sm:p-8 ${
                plan.highlighted
                  ? "border-primary/30 bg-gradient-to-br from-primary/[0.04] via-card to-card shadow-lg"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-brand-light px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}

              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">/ {plan.period}</span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={
                  plan.highlighted && !token
                    ? "/signup"
                    : plan.highlighted
                      ? "/billing/settings"
                      : token
                        ? "/generate"
                        : "/signup"
                }
                className={`btn mt-8 w-full px-6 py-3 text-center ${
                  plan.highlighted ? "btn-primary" : "btn-secondary"
                }`}
              >
                {plan.highlighted && !token
                  ? "Sign Up Free"
                  : plan.highlighted
                    ? "Upgrade to Pro"
                    : plan.cta.label}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="text-center text-lg font-semibold">
            Compare Plans Side by Side
          </h2>
          <div className="mt-6 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left font-medium">Feature</th>
                  <th className="px-4 py-3 text-center font-medium">Free</th>
                  <th className="px-4 py-3 text-center font-medium text-primary">Pro</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className={i < comparisonRows.length - 1 ? "border-b border-border" : ""}>
                    <td className="px-4 py-3 text-left text-muted-foreground">{row.feature}</td>
                    <td className="px-4 py-3 text-center">
                      {typeof row.free === "string" ? (
                        <span className="text-muted-foreground">{row.free}</span>
                      ) : row.free ? (
                        <Check className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-muted-foreground/40">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {typeof row.pro === "string" ? (
                        <span className="text-muted-foreground">{row.pro}</span>
                      ) : row.pro ? (
                        <Check className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-muted-foreground/40">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include free updates and community support. Pro comes with priority
            email support. Questions?{" "}
            <a href="mailto:imraj.engineer@gmail.com" className="text-primary hover:underline">
              Get in touch
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
