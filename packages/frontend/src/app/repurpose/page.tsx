"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shuffle, Loader2 } from "lucide-react";
import ToolPageLayout from "@/components/shared/tool-page-layout";
import AnalyzingState from "@/components/shared/analyzing-state";
import { apiFetch } from "@/lib/api-client";
import type { RepurposeResponse } from "@/types";

export default function RepurposePage() {
  const [title, setTitle] = useState("");
  const [niche, setNiche] = useState("");
  const [result, setResult] = useState<RepurposeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await apiFetch("/api/repurpose", {
        method: "POST",
        body: JSON.stringify({ title, niche: niche || undefined }),
      });
      if (!res.ok) throw new Error("Repurposing failed");
      setResult(await res.json());
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <ToolPageLayout
      title="Content Atomizer"
      description="Turn one YouTube title into platform-optimized posts for TikTok, Instagram, X, and LinkedIn — captions, hashtags, and timing included."
      icon={Shuffle}
      steps={[
        { num: 1, title: "Enter your content", desc: "Paste your YouTube title and niche." },
        { num: 2, title: "AI adapts per platform", desc: "Generates optimized posts for TikTok, Instagram, X, and LinkedIn." },
        { num: 3, title: "Export & post", desc: "Each post includes caption, hashtags, tips, and best posting time." },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-2">
          <label htmlFor="repurpose-title" className="text-sm font-medium">YouTube Title</label>
          <input
            id="repurpose-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. I Tried 30 Days of Cold Swimming"
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="repurpose-niche" className="text-sm font-medium">Niche <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input
            id="repurpose-niche"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. health, fitness, lifestyle"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary w-full px-6 py-2.5 sm:w-auto">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Repurposing..." : "Repurpose"}
        </button>
      </form>

      {!isLoggedIn && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <span className="text-muted-foreground">Results won&apos;t be saved. </span>
          <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          <span className="text-muted-foreground"> to track your history and unlock 3 analyses/day.</span>
        </div>
      )}

      {loading && <AnalyzingState icon={Shuffle} />}

      {error && <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {result?.posts && (
        <div className="mt-8 grid gap-4">
          {result.posts.map((post, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{post.platform}</p>
                <span className="font-mono text-sm text-muted-foreground">VPI: {post.viralPotentialIndex}</span>
              </div>
              <p className="text-sm font-medium">{post.title}</p>
              <p className="text-sm text-muted-foreground">{post.caption}</p>
              <div className="flex flex-wrap gap-1">
                {post.hashtags?.map((tag, j) => (
                  <span key={j} className="text-xs text-primary">{tag}</span>
                ))}
              </div>
              {post.tips?.length > 0 && (
                <ul className="space-y-0.5">
                  {post.tips.map((tip, j) => (
                    <li key={j} className="text-xs text-muted-foreground">• {tip}</li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted-foreground">Best time: {post.bestPostingTime}</p>
            </div>
          ))}
        </div>
      )}
    </ToolPageLayout>
  );
}
