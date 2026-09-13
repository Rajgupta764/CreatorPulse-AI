"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import ToolPageLayout from "@/components/shared/tool-page-layout";
import { apiFetch } from "@/lib/api-client";
import type { HookResponse } from "@/types";

export default function HookPage() {
  const [title, setTitle] = useState("");
  const [niche, setNiche] = useState("");
  const [result, setResult] = useState<HookResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await apiFetch("/api/hook", {
        method: "POST",
        body: JSON.stringify({ title, niche: niche || undefined }),
      });
      if (!res.ok) throw new Error("Hook generation failed");
      setResult(await res.json());
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <ToolPageLayout
      title="Hook Lab"
      description="Generate three ready-to-use opening hooks in different styles — hook your audience in the first 30 seconds."
      icon={Lightbulb}
      image="/images/download__12_-removebg-preview.png"
      steps={[
        { num: 1, title: "Enter your title", desc: "Paste your video title and niche for context-aware hooks." },
        { num: 2, title: "AI crafts hooks", desc: "Generates hooks in different styles — curiosity, bold statement, story-driven." },
        { num: 3, title: "Pick & refine", desc: "Each hook comes with a delivery tip, tone, and estimated duration." },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title" required className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Niche (optional)" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <button type="submit" disabled={loading} className="btn btn-primary w-full px-6 py-2.5 sm:w-auto">
          {loading ? "Generating..." : "Generate Hooks"}
        </button>
      </form>

      {error && <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {result?.hooks && (
        <div className="mt-8 grid gap-4">
          {result.hooks.map((hook: any, i: number) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-2">
              <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">{hook.style}</span>
              <p className="text-sm leading-relaxed">{hook.hook}</p>
              <p className="text-xs text-muted-foreground italic">{hook.deliveryTip}</p>
              <p className="text-xs text-muted-foreground">{hook.tone} — {hook.estimatedDuration}</p>
            </div>
          ))}
        </div>
      )}
    </ToolPageLayout>
  );
}
