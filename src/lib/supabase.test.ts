import { describe, expect, it } from "vitest";
import { isSupabaseConfigured, getSupabase } from "./supabase";

describe("supabase client", () => {
  it("exposes configuration flag and matching client presence", () => {
    expect(typeof isSupabaseConfigured).toBe("boolean");
    if (isSupabaseConfigured) {
      expect(getSupabase()).not.toBeNull();
    } else {
      expect(getSupabase()).toBeNull();
    }
  });
});
