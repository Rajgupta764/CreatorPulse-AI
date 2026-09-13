"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

export default function BillingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "success" | "timeout">("checking");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.replace("/login"); return; }

    let attempts = 0;
    const maxAttempts = 15;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await apiFetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.tier === "pro") {
            setStatus("success");
            clearInterval(interval);
            return;
          }
        }
      } catch { /* retry */ }

      if (attempts >= maxAttempts) {
        setStatus("timeout");
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [router]);

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Confirming your payment...</p>
        </div>
      </main>
    );
  }

  if (status === "timeout") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F59E0B]/10">
            <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
          </div>
          <h1 className="mt-4 text-xl font-bold">Still Processing</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your payment is being processed. It can take a moment — check your dashboard in a few minutes.
          </p>
          <Link href="/dashboard" className="btn btn-primary mt-6 px-6 py-3">
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#6FA56F]/10">
          <CheckCircle className="h-8 w-8 text-[#6FA56F]" />
        </div>
        <div className="mx-auto mt-4 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">You&apos;re Pro!</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome to CreatorPulse AI Pro. You now have 100 analyses/day and full history.
        </p>
        <Link href="/dashboard" className="btn btn-primary mt-8 w-full px-6 py-3">
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
