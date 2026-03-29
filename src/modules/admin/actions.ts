"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createJudgeAction(formData: {
  username: string;
  password_hash: string;
  name?: string | null;
  image_url?: string | null;
  role?: string | null;
  bio?: string | null;
}) {
  const supabase = createAdminClient();
  const normalizedEmail = `${formData.username.toLowerCase().trim()}@stem-mun.com`;

  // 1. Create the auth user via admin API (no email confirmation needed)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password: formData.password_hash,
    email_confirm: true,
    user_metadata: {
      name: formData.name,
      role: 'judge'
    },
    app_metadata: {
      role: 'judge'
    }
  });

  if (authError) {
    console.error("Auth Creation Error:", authError);
    return { error: authError.message };
  }

  const userId = authData.user.id;

  // 2. Insert into the judges table with matching ID
  const { data: judgeData, error: judgeError } = await supabase
    .from("judges")
    .insert([{
      id: userId, // Match Auth ID
      username: formData.username.toLowerCase().trim(),
      password_hash: formData.password_hash, // Still storing for record, but auth handles validation
      name: formData.name,
      image_url: formData.image_url,
      role: formData.role,
      bio: formData.bio
    }])
    .select();

  if (judgeError) {
    console.error("Judge Table Error:", judgeError);
    // Cleanup if possible? But auth user is already created.
    return { error: judgeError.message };
  }

  revalidatePath("/admin");
  return { success: true, data: judgeData[0] };
}

export async function deleteJudgeAction(id: string) {
  const supabase = createAdminClient();
  
  // 1. Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  if (authError) {
    console.error("Auth Deletion Error:", authError);
    // Even if auth delete fails (e.g. user already gone), we might want to continue with table cleanup
  }

  // 2. The database might have a cascade delete, but let's be explicit if not.
  // Assuming 'id' in judges table matches auth user 'id'.
  const { error: judgeError } = await supabase
    .from("judges")
    .delete()
    .eq("id", id);

  if (judgeError) {
    console.error("Judge Table Deletion Error:", judgeError);
    return { error: judgeError.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteDelegateAction(id: string) {
  const supabase = createAdminClient();

  // 1. Delete associated score events first (Foreign Key constraint handling)
  const { error: scoreError } = await supabase
    .from("score_events")
    .delete()
    .eq("profile_id", id);
  
  if (scoreError) {
    console.error("Score Events Deletion Error:", scoreError);
  }

  // 2. Delete the profile
  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id);

  if (profileError) {
    console.error("Profile Deletion Error:", profileError);
    return { error: profileError.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function getLeaderboard() {
  const supabase = createAdminClient();

  // 1. Fetch all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name, image_url, description, tags");

  if (profilesError) {
    console.error("Profiles Fetch Error:", profilesError);
    return { error: profilesError.message };
  }

  // 2. Fetch all score events
  const { data: scores, error: scoresError } = await supabase
    .from("score_events")
    .select("profile_id, value");

  if (scoresError) {
    console.error("Scores Fetch Error:", scoresError);
    return { error: scoresError.message };
  }

  // 3. Aggregate scores
  const scoreMap: Record<string, number> = {};
  scores.forEach(s => {
    scoreMap[s.profile_id] = (scoreMap[s.profile_id] || 0) + (s.value || 0);
  });

  // 4. Combine and sort
  const leaderboard = profiles.map(p => ({
    profile_id: p.id,
    name: p.name,
    image_url: p.image_url,
    total_score: Math.round((scoreMap[p.id] || 0) * 10) / 10,
    committee: p.tags?.[0] || 'General',
    sector: p.description?.slice(0, 20) + '...',
    performance_metric: (scoreMap[p.id] || 0) > 50 ? 'High' : 'Standard'
  })).sort((a, b) => Number(b.total_score) - Number(a.total_score));

  return { success: true, data: leaderboard };
}

export async function getProfileScore(profileId: string) {
  const supabase = createAdminClient();

  // 1. Fetch all score events for this profile
  const { data: scores, error: scoresError } = await supabase
    .from("score_events")
    .select("event_type, value")
    .eq("profile_id", profileId);

  if (scoresError) {
    console.error("Profile Score Fetch Error:", scoresError);
    return { error: scoresError.message };
  }

  // 2. Calculate metrics
  let totalScore = 0;
  let poiCount = 0;
  let pooCount = 0;

  scores.forEach(s => {
    totalScore += (s.value || 0);
    if (s.event_type === "POI_GIVEN") poiCount++;
    if (s.event_type === "POO") pooCount++;
  });

  return {
    success: true,
    data: {
      totalScore: Math.round(totalScore * 10) / 10,
      poiCount,
      pooCount
    }
  };
}
