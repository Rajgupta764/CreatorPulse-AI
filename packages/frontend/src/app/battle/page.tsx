"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Swords, Loader2 } from "lucide-react";
import ToolPageLayout from "@/components/shared/tool-page-layout";
import AnalyzingState from "@/components/shared/analyzing-state";
import { apiFetch } from "@/lib/api-client";
import type { BattleResponse } from "@/types";

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
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Winner</p>
            <p className="text-xl font-bold mt-1">{result.winner.title}</p>
            <p className="text-2xl font-mono font-bold text-primary mt-1">{result.winner.score}/100</p>
            <p className="text-sm text-muted-foreground mt-2">{result.winner.reason}</p>
          </div>
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
