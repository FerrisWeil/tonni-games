import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when real Supabase credentials are present. */
export const isSupabaseConfigured = Boolean(
  url &&
    anonKey &&
    !url.includes("your-project") &&
    anonKey !== "your-anon-key",
);

/**
 * Browser Supabase client. When env vars are missing, returns null so Wordle
 * keeps working entirely on localStorage.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;

export function getSupabase(): SupabaseClient | null {
  return supabase;
}
