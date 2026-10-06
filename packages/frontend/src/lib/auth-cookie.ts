export const AUTH_COOKIE = "auth_session";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const AUTH_COOKIE_OPTIONS = `path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;

export function setAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=1; ${AUTH_COOKIE_OPTIONS}`;
}

export function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
