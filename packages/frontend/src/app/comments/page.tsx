"use client";

import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import ToolPageLayout from "@/components/shared/tool-page-layout";
import AnalyzingState from "@/components/shared/analyzing-state";
import { apiFetch } from "@/lib/api-client";
import type { CommentsResponse } from "@/types";

function InsightCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="mt-1.5 text-sm">{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
          <span className="text-primary">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function CommentsPage() {
  const [comments, setComments] = useState("");
  const [niche, setNiche] = useState("");
  const [result, setResult] = useState<CommentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await apiFetch("/api/comments", {
        method: "POST",
        body: JSON.stringify({ comments, niche }),
      });
      if (!res.ok) throw new Error("Comment analysis failed");
      setResult(await res.json());
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <ToolPageLayout
      title="Audience Compass"
      description="Paste your YouTube comments and AI extracts pain points, sentiment, and content opportunities — understand your audience at scale."
      icon={MessageSquare}
      steps={[
        { num: 1, title: "Paste comments", desc: "Copy and paste real comments from your YouTube videos." },
        { num: 2, title: "AI mines insights", desc: "Identifies themes, pain points, and audience desires." },
        { num: 3, title: "Get video ideas", desc: "Each idea comes with a subscriber potential score and reasoning." },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-2">
          <label htmlFor="comments-input" className="text-sm font-medium">YouTube Comments</label>
          <textarea
            id="comments-input"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Paste YouTube comments here..."
            required
            rows={6}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="comments-niche" className="text-sm font-medium">Niche <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input
            id="comments-niche"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. tech reviews, gaming, fitness"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary w-full px-6 py-2.5 sm:w-auto">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Analyzing..." : "Analyze Comments"}
        </button>
      </form>

      {loading && <AnalyzingState icon={MessageSquare} />}

      {error && <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {result && (
        <div className="mt-8 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Summary</p>
            <p className="text-sm mt-1">{result.summary}</p>
          </div>

          {(result.sentiment || result.audienceProfile) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {result.sentiment && (
                <InsightCard title="Sentiment">
                  <p className="text-muted-foreground">{result.sentiment}</p>
                </InsightCard>
              )}
              {result.audienceProfile && (
                <InsightCard title="Audience profile">
                  <p className="text-muted-foreground">{result.audienceProfile}</p>
                </InsightCard>
              )}
            </div>
          )}

          {result.requestedTopics?.length > 0 && (
            <InsightCard title="Most requested topics">
              <ul className="flex flex-wrap gap-2">
                {result.requestedTopics.map((t, i) => (
                  <li
                    key={i}
                    className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs"
                  >
                    {t.topic}
                    {t.frequency && <span className="text-muted-foreground"> · {t.frequency}</span>}
                  </li>
                ))}
              </ul>
            </InsightCard>
          )}

          {result.questions?.length > 0 && (
            <InsightCard title="Questions your audience is asking">
              <ul className="space-y-2">
                {result.questions.map((q, i) => (
                  <li key={i}>
                    <p className="font-medium">{q.question}</p>
                    {q.context && <p className="text-xs text-muted-foreground">{q.context}</p>}
                  </li>
                ))}
              </ul>
            </InsightCard>
          )}

          {result.confusion?.length > 0 && (
            <InsightCard title="Points of confusion">
              <BulletList items={result.confusion} />
            </InsightCard>
          )}

          {result.painPoints?.length > 0 && (
            <InsightCard title="Pain points">
              <BulletList items={result.painPoints} />
            </InsightCard>
          )}

          {result.contentGapAlerts?.length > 0 && (
            <InsightCard title="Content gap alerts">
              <BulletList items={result.contentGapAlerts} />
            </InsightCard>
          )}

          {result.videoIdeas?.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Video Ideas</p>
              {result.videoIdeas.map((idea: any, i: number) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{idea.idea}</p>
                    <p className="text-xs text-muted-foreground mt-1">{idea.reason}</p>
                  </div>
                  <span className="text-lg font-mono font-bold text-primary shrink-0 ml-4">{idea.subscriberPotentialScore}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
}
