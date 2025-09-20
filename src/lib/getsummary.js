import { supabase } from "@/lib/supabaseClient";

export async function getUserSummary(userId) {
  // Profile Info
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", userId)
    .single();

  // Registration / Onboarding
  const { data: onboarding } = await supabase
    .from("onboarding")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Mental Health
  const { data: mental } = await supabase
    .from("mental_health_assessment")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Weekly Check-ins
  const { data: weekly } = await supabase
    .from("weekly_checkins")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return {
    profile,
    onboarding,
    mental,
    weekly,
  };
}
