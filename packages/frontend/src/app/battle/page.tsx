"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Swords, Loader2, Sparkles } from "lucide-react";
import ToolPageLayout from "@/components/shared/tool-page-layout";
import AnalyzingState from "@/components/shared/analyzing-state";
import { apiFetch } from "@/lib/api-client";
import type { BattleResponse } from "@/types";

type BattleSide = BattleResponse["winner"];

function TitleScoreCard({
  role,
  data,
  highlight = false,
}: {
  role: string;
  data: BattleSide;
  highlight?: boolean;
}) {
  if (!data) return null;
  return (
    <div
      className={`rounded-xl border p-6 ${
        highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-xs uppercase tracking-wide font-medium ${
              highlight ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {role}
          </p>
          <p className="mt-1 break-words font-semibold">{data.title}</p>
        </div>
        <p className="shrink-0 font-mono text-2xl font-bold text-primary">{data.score}</p>
      </div>

      {data.reason && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{data.reason}</p>
      )}

      {data.strengths && data.strengths.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Strengths</p>
          <ul className="mt-1.5 space-y-1">
            {data.strengths.map((s: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-primary">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.weaknesses && data.weaknesses.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Weaknesses</p>
          <ul className="mt-1.5 space-y-1">
            {data.weaknesses.map((w: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-destructive">-</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.scoreExplanation && (
        <p className="mt-3 border-t border-border pt-3 font-mono text-xs leading-relaxed text-muted-foreground">
          {data.scoreExplanation}
        </p>
      )}
    </div>
  );
}

function BattleForm() {
  const searchParams = useSearchParams();
  const [titleA, setTitleA] = useState("");
  const [titleB, setTitleB] = useState("");
  const [result, setResult] = useState<BattleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const prefill = searchParams.get("prefill");
    if (prefill) setTitleA(prefill);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await apiFetch("/api/battle", {
        method: "POST",
        body: JSON.stringify({ titleA, titleB }),
      });
      if (!res.ok) throw new Error("Battle failed");
      setResult(await res.json());
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-2">
          <label htmlFor="titleA" className="text-sm font-medium">Title A</label>
          <input
            id="titleA"
            value={titleA}
            onChange={(e) => setTitleA(e.target.value)}
            placeholder="e.g. I Built a Robot That Does My Job"
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="titleB" className="text-sm font-medium">Title B</label>
          <input
            id="titleB"
            value={titleB}
            onChange={(e) => setTitleB(e.target.value)}
            placeholder="e.g. My AI Assistant Took Over My Work"
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary w-full px-6 py-2.5 sm:w-auto">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Battling..." : "Battle"}
        </button>
      </form>

      {loading && (
        <AnalyzingState
          icon={Swords}
          phases={[
            "Weighing title A...",
            "Scoring title B...",
            "Declaring the winner...",
            "Fusing hybrid suggestion...",
          ]}
        />
      )}

      {error && <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {result && (
        <div className="mt-8 space-y-4">
          {result.summary && (
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Verdict</p>
              <p className="mt-1.5 text-sm leading-relaxed">{result.summary}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <TitleScoreCard role="Winner" data={result.winner} highlight />
            <TitleScoreCard role="Runner-up" data={result.loser} />
          </div>

          {result.teaser && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <p className="text-xs uppercase tracking-wide text-primary font-medium">Pro breakdown locked</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Upgrade to Pro to unlock the full verdict, strengths and weaknesses for both
                titles, and the hybrid suggestion.
              </p>
              <Link
                href="/pricing"
                className="btn btn-primary mt-4 inline-flex px-5 py-2.5 text-sm"
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                Upgrade to Pro
              </Link>
            </div>
          )}

          {result.hybridTitle && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <p className="text-xs uppercase tracking-wide text-primary font-medium">Hybrid Suggestion</p>
              <p className="text-lg font-semibold mt-1">{result.hybridTitle.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{result.hybridTitle.explanation}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function BattlePage() {
  return (
    <ToolPageLayout
      title="Title Fusion Lab"
      description="Pit two titles head-to-head. AI scores both, declares a winner, and fuses the best elements into a hybrid suggestion."
      icon={Swords}
      steps={[
        { num: 1, title: "Enter two titles", desc: "Paste your two best title ideas into the ring." },
        { num: 2, title: "AI judges", desc: "Scores both on virality, psychology, and patterns." },
        { num: 3, title: "Get the fusion", desc: "See the winner and a hybrid title combining the strongest parts." },
      ]}
    >
      <Suspense fallback={null}>
        <BattleForm />
      </Suspense>
    </ToolPageLayout>
  );
}
