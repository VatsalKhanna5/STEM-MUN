"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy, TrendingUp, User, Activity, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LeaderboardEntry {
  profile_id: string;
  name: string;
  image_url: string;
  total_score: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchLeaderboard();

    // Set up real-time subscription for score events to refresh the leaderboard
    const channel = supabase
      .channel("live_leaderboard")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "score_events",
        },
        () => {
          fetchLeaderboard(); // Recalculate on every new event
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchLeaderboard() {
    // We query the dynamic 'leaderboard' view created in the DB
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("total_score", { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Activity className="animate-pulse text-gray-800" size={32} />
        <p className="text-[10px] uppercase tracking-[0.5em] text-gray-700">Recalculating Global Rankings...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 py-10 px-6">
      <header className="text-center space-y-4 mb-20">
         <div className="inline-flex p-3 bg-white/5 border border-white/10 rounded-full mb-2">
            <Trophy size={24} className="text-white" />
         </div>
         <h1 className="text-6xl font-black uppercase tracking-tighter italic">Live Rankings</h1>
         <p className="text-gray-500 uppercase tracking-widest text-xs font-medium">Aggregated real-time event performance</p>
      </header>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {entries.map((entry, index) => (
            <motion.div
              layout
              key={entry.profile_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link
                href={`/profile/${entry.profile_id}`}
                className={cn(
                  "group flex items-center justify-between p-6 rounded-2xl border transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] cursor-pointer block",
                  index === 0 
                    ? "bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.1)]" 
                    : "bg-white/5 border-white/5 hover:border-white/20 text-white"
                )}
              >
                  <div className="flex items-center space-x-6">
                    <span className={cn(
                        "text-3xl font-black italic w-12",
                        index === 0 ? "text-black/20" : "text-white/10"
                    )}>
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <div className={cn(
                        "w-16 h-16 rounded-full overflow-hidden border p-1 transition-all duration-500",
                        index === 0 ? "border-black/10" : "border-white/10 grayscale group-hover:grayscale-0"
                    )}>
                      <img src={entry.image_url} alt={entry.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">{entry.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <TrendingUp size={12} className={index === 0 ? "text-black/40" : "text-green-500/60"} />
                        <p className={cn(
                            "text-[10px] uppercase tracking-widest font-bold",
                            index === 0 ? "text-black/40" : "text-gray-600"
                        )}>Trending Active</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-right flex flex-col items-end">
                      <span className="text-4xl font-black italic tabular-nums">{entry.total_score}</span>
                      <span className={cn(
                          "text-[9px] uppercase tracking-widest font-bold mt-1 opacity-50",
                          index === 0 ? "text-black" : "text-white"
                      )}>Aggregate Points</span>
                    </div>
                    <ChevronRight size={24} className={cn(
                        "transition-transform group-hover:translate-x-1 duration-500",
                        index === 0 ? "text-black/20" : "text-white/10"
                    )} />
                  </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {entries.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl">
             <User size={32} className="mx-auto text-gray-900 mb-4" />
             <p className="text-gray-600 uppercase tracking-widest text-[10px] italic">No participant signal detected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
