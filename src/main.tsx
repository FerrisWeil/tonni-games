import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { isSupabaseConfigured } from "@/lib/supabase";

if (import.meta.env.DEV) {
  console.debug(
    "[tonni-games] Supabase:",
    isSupabaseConfigured ? "configured" : "local fallback (no env)",
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
