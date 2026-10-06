import { clearAuthCookie } from "@/lib/auth-cookie";

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

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
