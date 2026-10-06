"use client";

import { useEffect } from "react";
import { setAuthCookie } from "@/lib/auth-cookie";

export default function AuthCookieSync() {
  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      setAuthCookie();
    }
  }, []);

  return null;
}
