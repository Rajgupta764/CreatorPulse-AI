"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

function getStrength(pw: string): { label: string; color: string; width: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;

  if (score <= 1) return { label: "Weak", color: "bg-destructive", width: "w-1/4" };
  if (score <= 2) return { label: "Fair", color: "bg-[#93785B]", width: "w-2/4" };
  if (score <= 3) return { label: "Good", color: "bg-[#F59E0B]", width: "w-3/4" };
  return { label: "Strong", color: "bg-[#6FA56F]", width: "w-full" };
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const passwordStrength = useMemo(() => getStrength(password), [password]);

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    const trimmedEmail = email.trim();
    if (touched.email && trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Enter a valid email address.";
    }
    if (touched.password && password && password.length < 8) {
      errors.password = "Must be at least 8 characters.";
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
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: trimmedEmail, password, displayName: displayName.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = Array.isArray(data.message) ? data.message.join("; ") : data.message;
        throw new Error(msg || "Registration failed");
      }

      const data = await res.json();

      localStorage.setItem("access_token", data.access_token);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
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
        {success ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-[#6FA56F]" />
            <h2 className="mt-4 text-xl font-bold">Account Created</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome to CreatorPulse AI! Redirecting to sign in...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <Link href="/" className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-brand-light text-sm font-bold text-primary-foreground">
                CPA
              </Link>
              <h1 className="mt-4 text-2xl font-bold">Create Account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Start optimizing your titles today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  placeholder="John Creator"
                />
              </div>

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
                      : touched.email && email.trim()
                        ? "border-[#6FA56F]"
                        : "border-input"
                  } ${touched.email && !fieldErrors.email ? "focus:border-[#6FA56F]" : "focus:border-primary"}`}
                  placeholder="creator@example.com"
                />
                {touched.email && fieldErrors.email && (
                  <p className="text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    required
                    minLength={8}
                    disabled={loading}
                    className={`w-full rounded-lg border bg-background px-3 py-2 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                      touched.password && !password
                        ? "border-input"
                        : touched.password && fieldErrors.password
                          ? "border-destructive"
                          : touched.password && passwordStrength.label === "Strong"
                            ? "border-[#6FA56F]"
                            : "border-input"
                    } focus:border-primary`}
                    placeholder="At least 8 characters"
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
                {touched.password && password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <div className={`h-1 rounded-full transition-all ${passwordStrength.color} ${passwordStrength.width}`} />
                      <div className="h-1 flex-1 rounded-full bg-muted" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password strength: <span className="font-medium">{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
                {touched.password && fieldErrors.password && (
                  <p className="text-xs text-destructive">{fieldErrors.password}</p>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full rounded-lg px-4 py-2 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>

            <div className="mt-4 border-t border-border pt-4 text-center">
              <Link href="/generate" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Continue without account &rarr;
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
