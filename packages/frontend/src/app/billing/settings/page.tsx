"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowLeft, Loader2, Check, CreditCard } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

export default function BillingSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.replace("/login"); return; }

    apiFetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.message) throw new Error(data.message);
        setProfile(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleUpgrade() {
    setCheckoutLoading(true);
    try {
      const res = await apiFetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setError(data.error || "Failed to start checkout."); }
    } catch { setError("Could not connect to billing server."); }
    finally { setCheckoutLoading(false); }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await apiFetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setError(data.error || "Could not open customer portal."); }
    } catch { setError("Could not connect to billing server."); }
    finally { setPortalLoading(false); }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-8 h-48 animate-pulse rounded-xl bg-muted" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="mt-8 rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      </main>
    );
  }

  const isPro = profile?.tier === "pro";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="mt-8">
        <h1 className="text-2xl font-bold">Billing & Plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      <div className={`mt-8 rounded-xl border-2 p-6 ${isPro ? "border-primary/20 bg-gradient-to-br from-primary/[0.04] to-primary/[0.01]" : "border-border bg-card"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isPro ? "bg-primary/10" : "bg-secondary"}`}>
              {isPro ? (
                <Sparkles className="h-6 w-6 text-primary" />
              ) : (
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">{isPro ? "Pro Plan" : "Free Plan"}</p>
                {isPro && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isPro ? "100 analyses/day, full history, priority support" : "3 analyses/day, limited history"}
              </p>
            </div>
          </div>
        </div>

        {isPro && (
          <div className="mt-6 border-t border-border pt-4">
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="btn btn-secondary px-5 py-2.5 text-sm"
            >
              {portalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> : null}
              Manage Subscription
            </button>
          </div>
        )}
      </div>

      {!isPro && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-gradient-to-r from-primary/[0.06] to-primary/[0.01] p-5">
            <h3 className="font-semibold">Upgrade to Pro</h3>
            <ul className="mt-3 space-y-2">
              {["100 analyses per day", "Full generation history", "AI title alternatives", "Title battle comparisons", "Priority support"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 shrink-0 text-[#6FA56F]" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="btn btn-primary mt-5 w-full px-6 py-3"
            >
              {checkoutLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4 inline" />
              )}
              Upgrade to Pro — $9/month
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
