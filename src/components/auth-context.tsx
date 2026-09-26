import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  authRedirectTo,
  getSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase";

export type AuthStatus = "loading" | "ready";

type AuthContextValue = {
  status: AuthStatus;
  configured: boolean;
  session: Session | null;
  user: User | null;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    isSupabaseConfigured ? "loading" : "ready",
  );
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setStatus("ready");
      return;
    }

    let cancelled = false;

    sb.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setStatus("ready");
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setStatus("ready");
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      return { error: "Sign-in unavailable — Supabase is not configured." };
    }
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: authRedirectTo("/account"),
        queryParams: { prompt: "select_account" },
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    const sb = getSupabase();
    if (!sb) {
      return { error: "Sign-in unavailable — Supabase is not configured." };
    }
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      return { error: "Enter a valid email address." };
    }
    const { error } = await sb.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: authRedirectTo("/account"),
        shouldCreateUser: true,
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return { error: null };
    const { error } = await sb.auth.signOut();
    return { error: error?.message ?? null };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      configured: isSupabaseConfigured,
      session,
      user: session?.user ?? null,
      signInWithGoogle,
      signInWithMagicLink,
      signOut,
    }),
    [status, session, signInWithGoogle, signInWithMagicLink, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
