"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import ToolPageLayout from "@/components/shared/tool-page-layout";
import { apiFetch } from "@/lib/api-client";
import type { ValidateResponse } from "@/types";

export default function ValidatePage() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<ValidateResponse | null>(null);
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
      const res = await apiFetch("/api/validate", {
        method: "POST",
        body: JSON.stringify({ idea }),
      });
      if (!res.ok) throw new Error("Validation failed");
      setResult(await res.json());
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <ToolPageLayout
      title="Idea Incubator"
      description="Describe your video idea and get scored across 6 dimensions — competition, demand, virality, difficulty, gap, and opportunity."
      icon={ClipboardCheck}
      image="/images/download__12_-removebg-preview.png"
      steps={[
        { num: 1, title: "Describe your idea", desc: "Write a short description of your video concept." },
        { num: 2, title: "AI scores 6 dimensions", desc: "Evaluates competition, demand, virality potential, difficulty, content gaps, and opportunity." },
        { num: 3, title: "Evolve it", desc: "Get an evolved version of your idea with a predicted higher score." },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <textarea value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Describe your video idea..." required rows={4} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <button type="submit" disabled={loading} className="btn btn-primary w-full px-6 py-2.5 sm:w-auto">
          {loading ? "Validating..." : "Validate Idea"}
        </button>
      </form>

      {!isLoggedIn && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <span className="text-muted-foreground">Results won&apos;t be saved. </span>
          <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          <span className="text-muted-foreground"> to track your history and unlock 3 analyses/day.</span>
        </div>
      )}

      {error && <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {result && (
        <div className="mt-8 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-4xl font-mono font-bold">{result.overallScore}/100</p>
            <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["competition", "demand", "virality", "difficulty", "contentGap", "opportunity"].map((dim) => (
              <div key={dim} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground capitalize">{dim.replace(/([A-Z])/g, ' $1')}</p>
                <p className="text-lg font-mono font-bold mt-1">{result[dim]?.score ?? "?"}</p>
                <p className="text-xs text-muted-foreground mt-1">{result[dim]?.explanation ?? ""}</p>
              </div>
            ))}
          </div>
          {result.evolution && (
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Evolved Idea</p>
              <p className="text-lg font-semibold mt-1">{result.evolution.evolvedIdea}</p>
              <p className="text-sm text-muted-foreground mt-1">Estimated new score: {result.evolution.estimatedNewScore}/100</p>
              <p className="text-sm text-muted-foreground mt-1">{result.evolution.explanation}</p>
            </div>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
}
