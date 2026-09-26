/**
 * Supabase is deferred until sign-in (ADR 0004). Stub keeps optional env wiring
 * without requiring `@supabase/supabase-js` until that ADR is revisited.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when real Supabase credentials are present (client still unused). */
export const isSupabaseConfigured = Boolean(
  url &&
    anonKey &&
    !url.includes("your-project") &&
    anonKey !== "your-anon-key",
);

export const supabase = null;

export function getSupabase(): null {
  return supabase;
}
