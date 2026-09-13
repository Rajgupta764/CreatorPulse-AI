"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Loader2, Swords, Sparkles } from "lucide-react";
import ToolPageLayout from "@/components/shared/tool-page-layout";
import AnalyzingState from "@/components/shared/analyzing-state";
import { apiFetch } from "@/lib/api-client";
import type { AnalyzeResponse, GeneratedTitle } from "@/types";

export default function GeneratePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [niche, setNiche] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alternatives, setAlternatives] = useState<GeneratedTitle[] | null>(null);
  const [generatingAlts, setGeneratingAlts] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await apiFetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ title, niche: niche || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAlts() {
    if (!result?.analysis?.nextAction) return;
    setGeneratingAlts(true);
    setAlternatives(null);
    try {
      const res = await apiFetch("/api/analyze/alternatives", {
        method: "POST",
        body: JSON.stringify({ title, suggestion: result.analysis.nextAction }),
      });
      if (!res.ok) throw new Error("Failed to generate alternatives");
      setAlternatives(await res.json());
    } catch {
      setAlternatives([]);
    } finally {
      setGeneratingAlts(false);
    }
  }

  return (
    <ToolPageLayout
      title="Title DNA Analyzer"
      description="Paste any YouTube title and get a full AI-powered breakdown — virality score, psychology dimensions, patterns, power words, and your smartest next move."
      icon={BarChart3}
      image="/images/download__12_-removebg-preview.png"
      steps={[
        { num: 1, title: "Paste your title", desc: "Enter any YouTube title and optionally specify your niche for personalized insights." },
        { num: 2, title: "AI deep analysis", desc: "Our engine scores virality, psychology, patterns, and power words in seconds." },
        { num: 3, title: "Get your playbook", desc: "Review your score breakdown, then follow the actionable next move to optimize." },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">YouTube Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter YouTube title..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="niche" className="text-sm font-medium">Niche <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input
            id="niche"
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. tech, gaming, education"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full px-6 py-2.5 sm:w-auto"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Analyzing..." : "Analyze Title"}
        </button>
      </form>

      {loading && <AnalyzingState icon={BarChart3} />}

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Virality Score</p>
            <p className="text-4xl font-bold font-mono text-foreground">
              {result.analysis.viralityScore}/100
            </p>
            {result.analysis.userContext && (
              <p className="text-sm text-muted-foreground mt-1">
                Personal avg: {result.analysis.userContext.personalAverageVirality ?? "N/A"}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Patterns</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.analysis.patterns?.map((p: string) => (
                  <span key={p} className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Power Words</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.analysis.powerWords?.map((w: string) => (
                  <span key={w} className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {result.analysis.psychology && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <p className="text-sm font-medium">Psychology Dimensions</p>
              {Object.entries(result.analysis.psychology).map(([dim, score]) => (
                <div key={dim} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{dim}</span>
                    <span className="font-mono font-medium">{score as number}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.analysis.nextAction && (
            <div className="rounded-xl border border-primary/20 bg-card p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Your Playbook</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{result.analysis.nextAction}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push(`/battle?prefill=${encodeURIComponent(title)}`)}
                  className="btn btn-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs"
                >
                  <Swords className="h-3.5 w-3.5" />
                  Test in Title Battle
                </button>
                <button
                  onClick={handleGenerateAlts}
                  disabled={generatingAlts}
                  className="btn btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs"
                >
                  {generatingAlts ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {generatingAlts ? "Generating..." : "Generate 3 Alternatives"}
                </button>
              </div>

              {alternatives && alternatives.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Alternatives</p>
                  {alternatives.map((alt, i) => (
                    <div key={i} className="rounded-lg border border-border bg-background p-3">
                      <p className="text-sm font-medium">{alt.title}</p>
                      {alt.explanation && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{alt.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {alternatives !== null && alternatives.length === 0 && !generatingAlts && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Could not generate alternatives. Try again.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
}
