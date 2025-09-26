// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// ✅ Use Vite's import.meta.env (NOT process.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Missing Supabase environment variables! Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // ✅ This keeps users logged in
    autoRefreshToken: true, // ✅ Automatically refreshes expired tokens
    detectSessionInUrl: true, // ✅ Important for OAuth callbacks & email links
  },
});

console.log("Supabase URL 👉", import.meta.env.VITE_SUPABASE_URL);
console.log("Supabase Key 👉", import.meta.env.VITE_SUPABASE_ANON_KEY);