"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Sparkles, TrendingUp, TrendingDown, Minus,
  BarChart3, Swords, Zap, Flame, Target, Trophy,
  MessageSquare, Clock, ArrowRight, Rocket,
  Lightbulb, ClipboardCheck, Map, Shuffle,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type { DashboardData } from "@/types";

/* ── helpers ────────────────────────────────────────────────── */

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const typeConfig: Record<string, { icon: typeof BarChart3; color: string; bg: string }> = {
  generate: { icon: BarChart3, color: "text-amber-400", bg: "bg-amber-400/10" },
  battle:   { icon: Swords,    color: "text-warm-brown", bg: "bg-warm-brown/10" },
  hook:     { icon: Lightbulb, color: "text-muted-tan", bg: "bg-muted-tan/10" },
  validate: { icon: ClipboardCheck, color: "text-green-500", bg: "bg-green-500/10" },
  readiness:{ icon: Rocket,    color: "text-[#D96B5B]",  bg: "bg-[#D96B5B]/10" },
  comments: { icon: MessageSquare, color: "text-light-beige", bg: "bg-light-beige/10" },
  "content-gap": { icon: Map,  color: "text-amber-500", bg: "bg-amber-500/10" },
  repurpose:{ icon: Shuffle,   color: "text-amber-400", bg: "bg-amber-400/10" },
};

const actionIcons: Record<string, typeof BarChart3> = {
  "/generate": BarChart3,
  "/battle": Swords,
  "/hook": Lightbulb,
  "/validate": ClipboardCheck,
  "/readiness": Rocket,
  "/comments": MessageSquare,
  "/content-gap": Map,
  "/repurpose": Shuffle,
};

const priorityStyles: Record<string, string> = {
  high:   "border-primary/20 bg-primary/[0.03] hover:border-primary/40",
  medium: "border-border bg-card hover:border-primary/20",
  low:    "border-border bg-card hover:border-secondary",
};

/* ── sub-components ─────────────────────────────────────────── */

function TrendBadge({ trend }: { trend: DashboardData["scoreTrend"] }) {
  if (!trend || trend.direction === "flat") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        <Minus className="h-2.5 w-2.5" />
        Flat
      </span>
    );
  }
  const isUp = trend.direction === "up";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        isUp ? "bg-green-500/10 text-green-500" : "bg-[#D96B5B]/10 text-[#D96B5B]"
      }`}
    >
      {isUp ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {Math.abs(trend.percentChange).toFixed(0)}%
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  trend,
  accent,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string | number;
  suffix?: string;
  trend?: DashboardData["scoreTrend"];
  accent?: string;
}) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent || "bg-primary/10"}`}>
          <Icon className={`h-5 w-5 ${accent ? "text-current" : "text-primary"}`} />
        </div>
        {trend && <TrendBadge trend={trend} />}
      </div>
      <p className="mt-3 font-mono text-2xl font-bold tracking-tight">{value}{suffix && <span className="ml-0.5 text-sm font-normal text-muted-foreground">{suffix}</span>}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-7 w-16 animate-pulse rounded bg-muted" />
      <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-muted" />
    </div>
  );
}

function WeeklyChart({ data }: { data: { week: string; avgScore: number }[] }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.avgScore), 1);
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Score Trend</p>
          <p className="text-xs text-muted-foreground">Weekly average virality</p>
        </div>
        <Target className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-4 flex items-end gap-1.5" style={{ height: 100 }}>
        {data.map((d, i) => (
          <div key={i} className="group/bar relative flex flex-1 items-end">
            <div
              className="w-full rounded-t-sm bg-primary/20 transition-all group-hover/bar:bg-primary/40"
              style={{ height: `${(d.avgScore / max) * 100}%`, minHeight: 4 }}
            />
            <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 transition-opacity group-hover/bar:opacity-100">
              {d.avgScore.toFixed(0)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
        <span>{data[0]?.week}</span>
        <span>{data[data.length - 1]?.week}</span>
      </div>
    </div>
  );
}

function PatternStats({ patterns }: { patterns: DashboardData["patternStats"] }) {
  if (!patterns || patterns.length === 0) return null;
  const top = patterns.slice(0, 4);
  const maxCount = Math.max(...top.map((p) => p.count), 1);
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Top Patterns</p>
          <p className="text-xs text-muted-foreground">Most used title patterns</p>
        </div>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-4 space-y-3">
        {top.map((p, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{p.pattern}</span>
              <span className="text-muted-foreground">{p.count} uses · avg {p.avgScore.toFixed(0)}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${(p.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DimensionInsight({
  label,
  score,
  icon: Icon,
  color,
}: {
  label: string;
  score: number;
  icon: typeof Trophy;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-mono text-sm font-bold">{score.toFixed(0)}/100</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <LayoutDashboard className="h-6 w-6 text-primary" />
      </div>
      <p className="mt-4 text-sm font-semibold">Welcome to your Command Center</p>
      <p className="mt-1 max-w-sm mx-auto text-xs text-muted-foreground">
        Start analyzing titles, running battles, and validating ideas. Your stats and insights will appear here.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/generate" className="btn btn-primary px-5 py-2 text-sm">
          <BarChart3 className="h-4 w-4" />
          Analyze a Title
        </Link>
        <Link href="/battle" className="btn btn-secondary px-5 py-2 text-sm">
          <Swords className="h-4 w-4" />
          Start a Battle
        </Link>
      </div>
    </div>
  );
}

/* ── main page ──────────────────────────────────────────────── */

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tier, setTier] = useState("free");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    async function load() {
      try {
        const [dashRes, profileRes] = await Promise.all([
          apiFetch("/api/dashboard"),
          apiFetch("/api/auth/me"),
        ]);
        if (!dashRes.ok) throw new Error("Failed to load dashboard");
        setData(await dashRes.json());

        if (profileRes.ok) {
          const p = await profileRes.json();
          setTier(p.tier || "free");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  /* loading skeleton */
  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
          <div>
            <div className="h-6 w-56 animate-pulse rounded bg-muted" />
            <div className="mt-1.5 h-4 w-72 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-xl border border-border bg-card" />
          <div className="h-48 animate-pulse rounded-xl border border-border bg-card" />
        </div>
      </main>
    );
  }

  /* error */
  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="btn btn-secondary mt-4 px-4 py-2"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const isEmpty = data && data.totalGenerations === 0 && data.totalBattles === 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* header */}
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <div className="absolute inset-[-3px] rounded-full border border-primary/20" />
          <LayoutDashboard className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Growth Command Center</h1>
          <div className="mx-auto mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-primary to-brand-light sm:mx-0" />
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Your personal analytics hub — track generations, battles, scores, streaks, and
            cross-feature insights.
          </p>
        </div>
      </div>

      {/* upgrade banner */}
      {tier === "free" && (
        <section className="mt-8 overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.07] to-primary/[0.02] p-4 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Unlock Your Full Potential</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Pro users get 100 analyses/day, priority support, full history, and advanced insights.
              </p>
            </div>
          </div>
          <Link href="/pricing" className="btn btn-primary mt-3 shrink-0 px-5 py-2.5 text-sm sm:mt-0 sm:ml-4">
            Upgrade to Pro
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      )}

      {data && isEmpty && <EmptyState />}

      {data && !isEmpty && (
        <div className="mt-8 space-y-6">
          {/* stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Zap}
              label="Generations"
              value={data.totalGenerations}
              accent="bg-amber-400/10 text-amber-400"
            />
            <StatCard
              icon={Swords}
              label="Battles"
              value={data.totalBattles}
              accent="bg-warm-brown/10 text-warm-brown"
            />
            <StatCard
              icon={Flame}
              label="Avg Score"
              value={data.averageViralityScore}
              suffix="/100"
              trend={data.scoreTrend}
              accent="bg-[#D96B5B]/10 text-[#D96B5B]"
            />
            <StatCard
              icon={Trophy}
              label="Day Streak"
              value={data.streak}
              suffix={data.streak === 1 ? " day" : " days"}
              accent="bg-green-500/10 text-green-500"
            />
          </div>

          {/* charts row */}
          <div className="grid gap-4 lg:grid-cols-2">
            <WeeklyChart data={data.weeklyAverages} />
            <PatternStats patterns={data.patternStats} />
          </div>

          {/* dimensions row */}
          {(data.weakestDimension || data.strongestDimension) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.strongestDimension && (
                <DimensionInsight
                  label={`Strongest: ${data.strongestDimension.name}`}
                  score={data.strongestDimension.avgScore}
                  icon={Trophy}
                  color="bg-green-500/10 text-green-500"
                />
              )}
              {data.weakestDimension && (
                <DimensionInsight
                  label={`Needs Work: ${data.weakestDimension.name}`}
                  score={data.weakestDimension.avgScore}
                  icon={Target}
                  color="bg-warm-brown/10 text-warm-brown"
                />
              )}
            </div>
          )}

          {/* quick actions */}
          {data.quickActions?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold">Quick Actions</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.quickActions.map((action, i) => {
                  const ActionIcon = actionIcons[action.link] || Zap;
                  return (
                    <Link
                      key={i}
                      href={action.link}
                      className={`group rounded-xl border p-4 transition-all ${
                        priorityStyles[action.priority] || priorityStyles.medium
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                          <ActionIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{action.label}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* insights */}
          {data.crossFeatureInsights?.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Insights</h2>
                  <p className="text-xs text-muted-foreground">Cross-feature recommendations</p>
                </div>
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-4 space-y-2">
                {data.crossFeatureInsights.map((insight, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg border border-primary/10 bg-primary/[0.02] p-3"
                  >
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-muted-foreground">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* recent activity */}
          {data.recentActivity?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Recent Activity</h2>
                <Link href="/history" className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-border rounded-xl border border-border">
                {data.recentActivity.map((item, i) => {
                  const cfg = typeConfig[item.type] || { icon: Zap, color: "text-muted-foreground", bg: "bg-muted" };
                  const TypeIcon = cfg.icon;
                  return (
                    <Link
                      key={i}
                      href={item.link}
                      className="group flex items-center gap-3 p-4 transition-colors hover:bg-secondary/50"
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                        <TypeIcon className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{relativeTime(item.date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium capitalize">
                          {item.type}
                        </span>
                        {item.score != null && (
                          <span className="font-mono text-sm font-bold">{item.score}</span>
                        )}
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* secondary stats row */}
          <div className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-3">
            <div className="text-center">
              <p className="font-mono text-xl font-bold">{data.bestViralityScore}</p>
              <p className="text-xs text-muted-foreground">Best Score Ever</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-xl font-bold capitalize">{data.mostUsedPattern || "—"}</p>
              <p className="text-xs text-muted-foreground">Most Used Pattern</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-xl font-bold capitalize">{data.bestPerformingPattern || "—"}</p>
              <p className="text-xs text-muted-foreground">Best Performing Pattern</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
