"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/* --- JUDGE MANAGEMENT --- */

export async function createJudgeAction(formData: {
  username: string;
  password_hash: string;
  name?: string | null;
  image_url?: string | null;
  role?: string | null;
  bio?: string | null;
}) {
  const supabase = createAdminClient();
  const normalizedEmail = `${formData.username.toLowerCase().trim()} @stem-mun.com`;

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password: formData.password_hash,
    email_confirm: true,
    user_metadata: { name: formData.name, role: 'judge' },
    app_metadata: { role: 'judge' }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
        const { data: userList } = await supabase.auth.admin.listUsers();
        const existingUser = userList?.users.find(u => u.email === normalizedEmail);
        if (existingUser) return await upsertJudgeProfile(existingUser.id, formData);
    }
    return { error: authError.message };
  }

  return await upsertJudgeProfile(authData.user.id, formData);
}

async function upsertJudgeProfile(userId: string, formData: any) {
    const supabase = createAdminClient();
    const { data: judgeData, error: judgeError } = await supabase
    .from("judges")
    .upsert([{
      id: userId,
      username: formData.username.toLowerCase().trim(),
      password_hash: formData.password_hash,
      name: formData.name,
      image_url: formData.image_url,
      role: formData.role,
      bio: formData.bio
    }])
    .select();

  if (judgeError) return { error: judgeError.message };
  revalidatePath("/admin");
  return { success: true, data: judgeData?.[0] };
}

export async function deleteJudgeAction(id: string) {
  const supabase = createAdminClient();
  await supabase.auth.admin.deleteUser(id);
  const { error } = await supabase.from("judges").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

/* --- DELEGATE MANAGEMENT --- */

export async function deleteDelegateAction(id: string) {
  const supabase = createAdminClient();
  await supabase.from("score_events").delete().eq("profile_id", id);
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

/* --- SCORING & LEADERBOARD --- */

export async function getLeaderboard() {
  try {
    const supabase = createAdminClient();
    const [profilesRes, scoresRes] = await Promise.all([
      supabase.from("profiles").select("id, name, image_url, description, tags"),
      supabase.from("score_events").select("profile_id, value")
    ]);

    if (profilesRes.error) throw profilesRes.error;
    if (scoresRes.error) throw scoresRes.error;

    const scoreMap: Record<string, number> = {};
    (scoresRes.data || []).forEach(s => {
      scoreMap[s.profile_id] = (scoreMap[s.profile_id] || 0) + (s.value || 0);
    });

    const leaderboard = (profilesRes.data || []).map(p => ({
      profile_id: p.id,
      name: p.name,
      image_url: p.image_url,
      total_score: Math.round((scoreMap[p.id] || 0) * 10) / 10,
      committee: p.tags?.[0] || 'General',
      sector: p.description?.slice(0, 30) || '---',
      performance_metric: (scoreMap[p.id] || 0) > 50 ? 'Elite' : 'Active'
    })).sort((a, b) => b.total_score - a.total_score);

    return { success: true, data: leaderboard };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getProfileScore(profileId: string) {
  try {
    const supabase = createAdminClient();
    const { data: scores, error } = await supabase
      .from("score_events")
      .select("event_type, value")
      .eq("profile_id", profileId);

    if (error) throw error;

    let totalScore = 0;
    let poiCount = 0;
    let pooCount = 0;

    (scores || []).forEach(s => {
      totalScore += (s.value || 0);
      if (s.event_type === "POI_GIVEN") poiCount++;
      if (s.event_type === "POO") pooCount++;
    });

    return { success: true, data: { totalScore: Math.round(totalScore * 10) / 10, poiCount, pooCount } };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function addScoreEventAction(event: {
  profile_id: string;
  judge_id: string;
  round_id: string;
  event_type: string;
  value: number;
  remark?: string | null;
}) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("score_events").insert([event]).select();
    if (error) throw error;
    revalidatePath("/");
    revalidatePath("/leaderboard");
    return { success: true, data: data?.[0] };
  } catch (err: any) {
    return { error: err.message };
  }
}

/* --- SYSTEM CONFIG --- */

export async function getSystemConfig() {
  try {
    const supabase = createAdminClient();
    const [roundRes, configRes, profileRes] = await Promise.all([
      supabase.from("rounds").select("*").eq("is_active", true).maybeSingle(),
      supabase.from("scoring_config").select("*").limit(1).maybeSingle(),
      supabase.from("profiles").select("*").order("name", { ascending: true })
    ]);

    if (roundRes.error) throw roundRes.error;
    if (configRes.error) throw configRes.error;
    if (profileRes.error) throw profileRes.error;

    return {
      success: true,
      data: {
        activeRound: roundRes.data,
        scoringConfig: configRes.data,
        profiles: profileRes.data || []
      }
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

/* --- EMERGENCY SEED --- */

export async function seedJudgesAction() {
  const judges = [
    { username: 'samridhi', name: 'Samridhi Saini', role: 'Co-Chair', password: 'Password123' },
    { username: 'bhavya', name: 'Bhavya Goyal', role: 'Co-Chair', password: 'Password123' },
    { username: 'tanveer', name: 'Tanveer Singh', role: 'Co-Chair', password: 'Password123' },
    { username: 'vatsal', name: 'Vatsal Khanna', role: 'Co-Chair', password: 'Password123' }
  ];

  const results = [];
  for (const j of judges) {
    const res = await createJudgeAction({ username: j.username, password_hash: j.password, name: j.name, role: j.role });
    results.push({ name: j.name, success: !!res.success, error: res.error });
  }
  return results;
}
