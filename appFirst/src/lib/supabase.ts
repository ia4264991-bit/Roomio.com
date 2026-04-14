import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string | undefined);
export const supabaseEnvError =
  !supabaseUrl || !supabaseKey
    ? "Missing Supabase envs in deployment: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or VITE_SUPABASE_ANON_KEY)."
    : null;

if (supabaseEnvError) {
  console.warn(
    "[supabase] Missing VITE_SUPABASE_URL or key. Set VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY).",
  );
}

export const supabase = createClient(supabaseUrl || "https://example.supabase.co", supabaseKey || "public-anon-key", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

