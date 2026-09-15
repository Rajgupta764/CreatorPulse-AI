"use client";

import { useState } from "react";
import { Map, Loader2 } from "lucide-react";
import ToolPageLayout from "@/components/shared/tool-page-layout";
import AnalyzingState from "@/components/shared/analyzing-state";
import { apiFetch } from "@/lib/api-client";
import type { ContentGapResponse } from "@/types";

export default function ContentGapPage() {
  const [urls, setUrls] = useState("");
  const [topics, setTopics] = useState("");
  const [result, setResult] = useState<ContentGapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await apiFetch("/api/content-gap", {
        method: "POST",
        body: JSON.stringify({ urls: urls || undefined, topics: topics || undefined }),
      });
      if (!res.ok) throw new Error("Content gap analysis failed");
      setResult(await res.json());
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <ToolPageLayout
      title="Opportunity Map"
      description="Analyze your competition and discover untapped content opportunities ranked by difficulty, timeline, and first-mover advantage."
      icon={Map}
      steps={[
        { num: 1, title: "Enter competitors", desc: "Provide competitor URLs or describe your niche." },
        { num: 2, title: "AI maps the landscape", desc: "Identifies saturated topics and hidden content gaps." },
        { num: 3, title: "Discover opportunities", desc: "Each opportunity includes score, difficulty, timeline, and first-mover flag." },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-2">
          <label htmlFor="gap-urls" className="text-sm font-medium">Competitor URLs <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea
            id="gap-urls"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="Paste competitor URLs or descriptions..."
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="gap-topics" className="text-sm font-medium">Niche / Topics <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea
            id="gap-topics"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="Your niche or topics of interest..."
            rows={2}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary w-full px-6 py-2.5 sm:w-auto">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Analyzing..." : "Find Gaps"}
        </button>
      </form>

      {loading && <AnalyzingState icon={Map} />}

      {error && <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {result && (
        <div className="mt-8 space-y-4">
          {result.everyoneCovers?.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Saturated Topics</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.everyoneCovers.map((t: string, i: number) => (
                  <span key={i} className="rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive">{t}</span>
                ))}
              </div>
            </div>
          )}
          {result.opportunities?.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Opportunities</p>
              {result.opportunities.map((opp: any, i: number) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">{opp.opportunity}</p>
                    <span className="text-lg font-mono font-bold text-chart-2 shrink-0 ml-4">{opp.opportunityScore}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{opp.rationale}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs capitalize">{opp.difficulty}</span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs capitalize">{opp.timeline}</span>
                    {opp.firstMoverAdvantage && <span className="rounded-md bg-chart-2/10 px-2 py-0.5 text-xs text-chart-2">First Mover</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
}
