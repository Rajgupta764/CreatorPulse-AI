import { clearAuthCookie } from "@/lib/auth-cookie";

// Origin of the backend API (e.g. https://api.example.com). Unset in local dev
// so requests stay relative and go through the next.config.ts rewrite.
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const target = url.startsWith("/") ? `${API_BASE}${url}` : url;
  const res = await fetch(target, { ...options, headers });

  if (res.status === 401 && token) {
    localStorage.removeItem("access_token");
    clearAuthCookie();
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  return res;
}

export function apiErrorMessage(data: unknown, fallback: string): string {
  const body = data as { message?: unknown; error?: unknown } | null;
  if (typeof body?.message === "string" && body.message.trim()) return body.message;
  if (Array.isArray(body?.message) && body.message.length) return body.message.join("; ");
  if (typeof body?.error === "string" && body.error.trim()) return body.error;
  return fallback;
}
