"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInButton({ next = "/", compact = false }: { next?: string; compact?: boolean }) {
  const [busy, setBusy] = useState(false);
  async function signIn() {
    setBusy(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) setBusy(false);
  }
  return (
    <button onClick={signIn} disabled={busy} className={compact ? "btn-ghost" : "btn"}>
      {busy ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}
