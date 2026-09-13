"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import ToolPageLayout from "@/components/shared/tool-page-layout";
import { apiFetch } from "@/lib/api-client";
import type { CommentsResponse } from "@/types";

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
      image="/images/download__12_-removebg-preview.png"
      steps={[
        { num: 1, title: "Paste comments", desc: "Copy and paste real comments from your YouTube videos." },
        { num: 2, title: "AI mines insights", desc: "Identifies themes, pain points, and audience desires." },
        { num: 3, title: "Get video ideas", desc: "Each idea comes with a subscriber potential score and reasoning." },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Paste YouTube comments here..." required rows={6} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Your niche (optional) e.g., tech reviews, gaming, fitness" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <button type="submit" disabled={loading} className="btn btn-primary w-full px-6 py-2.5 sm:w-auto">
          {loading ? "Analyzing..." : "Analyze Comments"}
        </button>
      </form>

      {error && <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {result && (
        <div className="mt-8 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Summary</p>
            <p className="text-sm mt-1">{result.summary}</p>
          </div>
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
