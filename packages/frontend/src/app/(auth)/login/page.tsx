"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    const trimmedEmail = email.trim();
    if (touched.email && trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Enter a valid email address.";
    }
    if (touched.password && !password) {
      errors.password = "Required.";
    }
    return errors;
  }, [email, password, touched]);

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = Array.isArray(data.message) ? data.message.join("; ") : data.message;
        throw new Error(msg || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/15 to-brand-light/10 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-brand-light/15 to-chart-2/10 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="mx-auto flex h-10 items-center justify-center">
            <img src="/logo.png" alt="CreatorPulse" style={{ height: '32px', width: 'auto' }} />
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Sign In</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back to CreatorPulse AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              required
              autoFocus
              disabled={loading}
              className={`w-full rounded-lg border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                touched.email && fieldErrors.email
                  ? "border-destructive"
                  : "border-input focus:border-primary"
              }`}
              placeholder="creator@example.com"
            />
            {touched.email && fieldErrors.email && (
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <span className="text-xs text-muted-foreground/50">Forgot password?</span>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                required
                disabled={loading}
                className={`w-full rounded-lg border bg-background px-3 py-2 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                  touched.password && fieldErrors.password
                    ? "border-destructive"
                    : "border-input focus:border-primary"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {touched.password && fieldErrors.password && (
              <p className="text-xs text-destructive">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full rounded-lg px-4 py-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-4 border-t border-border pt-4 text-center">
          <Link href="/generate" className="text-sm text-muted-foreground transition-colors hover:text-primary">
            Continue without account &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
