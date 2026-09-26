/**
 * Supabase client (ADR 0015 / 0023). Real `@supabase/supabase-js` when env is set;
 * null client + isSupabaseConfigured=false when missing (gameplay still works).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function looksConfigured(u: string | undefined, k: string | undefined): boolean {
  return Boolean(
    u &&
      k &&
      !u.includes("your-project") &&
      k !== "your-anon-key" &&
      u.startsWith("http"),
  );
}

/** True when real Supabase credentials are present. */
export const isSupabaseConfigured = looksConfigured(url, anonKey);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured && url && anonKey) {
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });
}

export const supabase = client;

export function getSupabase(): SupabaseClient | null {
  return client;
}

/** Redirect target after OAuth / magic link. Always lands on Account. */
export function authRedirectTo(path = "/account"): string {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}
