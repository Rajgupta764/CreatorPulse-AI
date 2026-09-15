"use client";

import { useState } from "react";
import { Rocket, Loader2 } from "lucide-react";
import ToolPageLayout from "@/components/shared/tool-page-layout";
import AnalyzingState from "@/components/shared/analyzing-state";
import { apiFetch } from "@/lib/api-client";
import type { ReadinessResponse } from "@/types";

export default function ReadinessPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hook, setHook] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [result, setResult] = useState<ReadinessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await apiFetch("/api/readiness", {
        method: "POST",
        body: JSON.stringify({ title, description, hook, thumbnail }),
      });
      if (!res.ok) throw new Error("Readiness check failed");
      setResult(await res.json());
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <ToolPageLayout
      title="Launch Command"
      description="Pre-flight check for your next video. Scores your title, description, hook, and thumbnail readiness with a Go / No-Go verdict."
      icon={Rocket}
      steps={[
        { num: 1, title: "Enter video details", desc: "Provide your title, description, hook script, and thumbnail description." },
        { num: 2, title: "AI scores readiness", desc: "Evaluates each element and calculates an overall readiness score." },
        { num: 3, title: "Fix & launch", desc: "Get a Go/No-Go verdict plus an improvement checklist." },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-2">
          <label htmlFor="readiness-title" className="text-sm font-medium">Title</label>
          <input
            id="readiness-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your video title"
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="readiness-desc" className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea
            id="readiness-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Video description"
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="readiness-hook" className="text-sm font-medium">Hook Script <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea
            id="readiness-hook"
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            placeholder="Your opening hook script"
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="readiness-thumb" className="text-sm font-medium">Thumbnail Description <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea
            id="readiness-thumb"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="e.g. Close-up of shocked face with red arrow pointing at text"
            rows={2}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary w-full px-6 py-2.5 sm:w-auto">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Scoring..." : "Check Readiness"}
        </button>
      </form>

      {loading && <AnalyzingState icon={Rocket} />}

      {error && <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {result && (
        <div className="mt-8 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className={`text-4xl font-mono font-bold ${result.goNoGo === "go" ? "text-chart-2" : "text-destructive"}`}>{result.overallScore}/100</p>
            <p className={`text-sm mt-1 uppercase font-medium ${result.goNoGo === "go" ? "text-chart-2" : "text-destructive"}`}>{result.goNoGo === "go" ? "Go — Ready to Launch" : "No-Go — Needs Improvement"}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[{ label: "Title", score: result.titleScore }, { label: "Description", score: result.descriptionScore }, { label: "Hook", score: result.hookScore }, { label: "Thumbnail", score: result.thumbnailScore }].map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="text-xl font-mono font-bold mt-1">{item.score}/100</p>
              </div>
            ))}
          </div>
          {result.improvementChecklist?.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-2">
              <p className="text-sm font-medium">Improvement Checklist</p>
              <ul className="space-y-1">
                {result.improvementChecklist.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
}
