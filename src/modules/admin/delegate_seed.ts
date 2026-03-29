"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function seedDelegatesAction() {
  const scienceDelegates = [
    "Kalpana Chawla", "Sunita Williams", "Albert Einstein", "Vikram Sarabhai", "Isaac Newton", 
    "Stephen Hawking", "Alan Turing", "Linus Torvalds", "Andrej Karpathy", "Vint Cerf", 
    "Fei-Fei Li", "Margaret Hamilton", "Satish Dhawan", "Geoffrey Hinton", "Nikola Tesla", 
    "Henry Ford", "Katherine Johnson", "Carl Friedrich Gauss", "Leonhard Euler", "John von Neumann"
  ].map(name => ({
    name,
    description: "STEM Pioneer // Science & Engineering Sector",
    image_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=131313&mouth=smile&top=shortHair,longHair,buzzCut,shavedSides`, 
    tags: ["Science & Engineering"],
    status: "active"
  }));

  const leadershipDelegates = [
    "Sheryl Sandberg", "Safra Catz", "Gita Gopinath", "Steve Jobs", "Elon Musk", 
    "Bill Gates", "Jeff Bezos", "Jack Ma", "Nikhil Kamath", "Mukesh Ambani", 
    "Sam Altman", "Dario Amodei", "Warren Buffett", "Mark Zuckerberg", "Sundar Pichai", 
    "Satya Nadella", "Tim Cook", "Jensen Huang", "Deepinder Goyal", "Demis Hassabis"
  ].map(name => ({
    name,
    description: "Global Leader // Industry & Strategy Sector",
    image_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=0a0a0a&clothes=suit&hairColor=black,brown`, 
    tags: ["Leadership & Industry"],
    status: "active"
  }));

  const allDelegates = [...scienceDelegates, ...leadershipDelegates];
  
  const supabase = createAdminClient();
  
  // Clear existing delegates to ensure clean seed if requested (commented for safety)
  // await supabase.from("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const results = [];
  for (const d of allDelegates) {
    const { data, error } = await supabase
      .from("profiles")
      .upsert([d], { onConflict: 'name' })
      .select();
    
    results.push({ name: d.name, success: !error, error: error?.message });
  }

  revalidatePath("/");
  revalidatePath("/leaderboard");
  return results;
}
