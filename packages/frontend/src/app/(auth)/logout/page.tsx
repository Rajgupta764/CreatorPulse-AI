"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("access_token");
    router.push("/");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <p className="text-muted-foreground">Signing out...</p>
    </main>
  );
}
