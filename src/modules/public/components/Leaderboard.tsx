"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import LiveIndicator from "@/components/ui/LiveIndicator";
import GlassCard from "@/components/cards/GlassCard";
import { Search, ChevronRight, TrendingUp, Activity, Terminal, AlertCircle } from "lucide-react";

interface LeaderboardEntry {
  profile_id: string;
  name: string;
  image_url: string;
  total_score: number;
  committee?: string;
  sector?: string;
  performance_metric?: string;
}

const SkeletonRow = () => (
  <div className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl animate-pulse">
    <div className="flex items-center gap-8">
      <div className="w-10 h-8 bg-white/10 rounded" />
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-white/10" />
        <div className="space-y-2">
          <div className="w-32 h-4 bg-white/10 rounded" />
          <div className="w-20 h-2 bg-white/5 rounded" />
        </div>
      </div>
    </div>
    <div className="w-24 h-10 bg-white/10 rounded" />
  </div>
);

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [nerdsOpen, setNerdsOpen] = useState(false);
  const supabase = createClient();

  // Throttled fetch to prevent rapid re-renders during peak event spikes
  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from("leaderboard")
        .select("profile_id, name, image_url, total_score, committee, sector, performance_metric")
        .order("total_score", { ascending: false });

      if (supabaseError) throw supabaseError;
      setEntries(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Leaderboard Fetch Error:", err);
      setError("Archive Uplink Interrupted. Attempting Re-sync...");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchLeaderboard();

    let throttleTimer: NodeJS.Timeout | null = null;
    const channel = supabase
      .channel("live_leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "score_events" },
        () => {
          // Internal Throttling (3s) to maintain stability under high volume
          if (!throttleTimer) {
            fetchLeaderboard();
            throttleTimer = setTimeout(() => {
              throttleTimer = null;
            }, 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [supabase, fetchLeaderboard]);

  // Optimized filtering with useMemo
  const filteredEntries = useMemo(() => {
    return entries.filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.committee && e.committee.toLowerCase().includes(search.toLowerCase()))
    );
  }, [entries, search]);

  const top3 = useMemo(() => filteredEntries.slice(0, 3), [filteredEntries]);
  const rest = useMemo(() => filteredEntries.slice(3), [filteredEntries]);

  if (loading && entries.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-20 space-y-12 w-full max-w-6xl mx-auto">
        <header className="text-center space-y-4 animate-pulse">
           <div className="w-48 h-4 bg-white/5 mx-auto rounded-full" />
           <div className="w-96 h-12 bg-white/10 mx-auto rounded-xl" />
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-end">
           <div className="h-64 bg-white/5 rounded-[3rem] animate-pulse" />
           <div className="h-80 bg-white/10 rounded-[3rem] animate-pulse" />
           <div className="h-64 bg-white/5 rounded-[3rem] animate-pulse" />
        </div>
        <div className="space-y-4 w-full">
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center animate-fade-in relative pt-40 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <header className="mb-20 max-w-4xl mx-auto text-center">
          <LiveIndicator label="Live Global Standings" />
          <h1 className="mt-8 font-display text-5xl md:text-8xl font-black text-foreground tracking-tighter leading-none uppercase italic">
            Leaderboard
          </h1>
          <p className="mt-6 text-white/30 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto uppercase tracking-tighter italic">
            Live standings of delegate performance across all committees // Updated in real-time.
          </p>
          
          {error && (
            <motion.div 
               initial={{ opacity: 0, y: -10 }} 
               animate={{ opacity: 1, y: 0 }}
               className="mt-8 flex items-center justify-center gap-3 text-red-500/60 text-[10px] font-black uppercase tracking-widest italic"
            >
               <AlertCircle size={14} />
               {error}
            </motion.div>
          )}
        </header>

        {/* 🏆 podium (Rank 01-03) */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-6xl mx-auto">
          {/* Rank 2 */}
          {top3[1] && (
            <div className="text-center order-2 md:order-1">
              <span className="inline-block mb-4 rounded-full border border-border/40 px-6 py-1.5 text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground italic">
                Rank 02
              </span>
              <Link href={`/profile/${top3[1].profile_id}`} className="block">
                <GlassCard
                  variant="elevated"
                  hover
                  className="p-10 transition-all duration-700 hover:scale-[1.02] border-border/10"
                >
                  <div className="mx-auto rounded-full overflow-hidden border-2 border-border/20 w-28 h-28 mb-8 shadow-luxury group relative">
                    <Image
                      src={top3[1].image_url || "/placeholder.svg"}
                      alt={top3[1].name}
                      fill
                      className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                    />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground uppercase italic tracking-tight">{top3[1].name}</h3>
                  <p className="mt-2 text-[9px] font-black tracking-[0.3em] uppercase text-muted-foreground opacity-60">
                    {top3[1].committee || "---"} // {top3[1].sector || "---"}
                  </p>
                  <p className="mt-6 font-display text-5xl font-bold text-foreground tabular-nums tracking-tighter italic">
                    {top3[1].total_score}
                  </p>
                  <p className="mt-3 text-[9px] font-bold tracking-widest uppercase text-secondary flex items-center justify-center gap-2">
                    <TrendingUp size={12} />
                    {top3[1].performance_metric || "---"} Performance
                  </p>
                </GlassCard>
              </Link>
            </div>
          )}

          {/* Rank 1 */}
          {top3[0] && (
            <div className="text-center order-1 md:order-2 scale-105 md:scale-110 mb-8 md:mb-12">
              <span className="inline-block mb-4 rounded-full bg-foreground px-8 py-2 text-[10px] font-black tracking-[0.4em] uppercase text-background shadow-xl shadow-white/5 italic">
                Rank 01
              </span>
              <Link href={`/profile/${top3[0].profile_id}`} className="block">
                <GlassCard
                  variant="elevated"
                  hover
                  className="p-12 transition-all duration-1000 hover:scale-[1.05] border-secondary/20 bg-secondary/[0.02] shadow-2xl shadow-secondary/10"
                >
                  <div className="mx-auto rounded-full overflow-hidden border-4 border-secondary/20 w-36 h-36 mb-10 shadow-luxury group relative">
                    <Image
                      src={top3[0].image_url || "/placeholder.svg"}
                      alt={top3[0].name}
                      fill
                      className="object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                    />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground uppercase italic tracking-tighter">{top3[0].name}</h3>
                  <p className="mt-2 text-[10px] font-black tracking-[0.4em] uppercase text-secondary italic">
                    {top3[0].committee || "---"} // {top3[0].sector || "---"}
                  </p>
                  <p className="mt-8 font-display text-7xl font-bold text-foreground tabular-nums tracking-tighter italic">
                    {top3[0].total_score}
                  </p>
                  <p className="mt-4 text-[10px] font-black tracking-[0.3em] uppercase text-secondary flex items-center justify-center gap-3 animate-pulse">
                    <Activity size={12} />
                    Elite Status Achieved
                  </p>
                </GlassCard>
              </Link>
            </div>
          )}

          {/* Rank 3 */}
          {top3[2] && (
            <div className="text-center order-3">
              <span className="inline-block mb-4 rounded-full border border-border/40 px-6 py-1.5 text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground italic">
                Rank 03
              </span>
              <Link href={`/profile/${top3[2].profile_id}`} className="block">
                <GlassCard
                  variant="elevated"
                  hover
                  className="p-10 transition-all duration-700 hover:scale-[1.02] border-border/10"
                >
                  <div className="mx-auto rounded-full overflow-hidden border-2 border-border/10 w-28 h-28 mb-8 shadow-luxury group relative">
                    <Image
                      src={top3[2].image_url || "/placeholder.svg"}
                      alt={top3[2].name}
                      fill
                      className="object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                    />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground uppercase italic tracking-tight">{top3[2].name}</h3>
                  <p className="mt-2 text-[9px] font-black tracking-[0.3em] uppercase text-muted-foreground opacity-60">
                    {top3[2].committee || "---"} // {top3[2].sector || "---"}
                  </p>
                  <p className="mt-6 font-display text-5xl font-bold text-foreground tabular-nums tracking-tighter italic">
                    {top3[2].total_score}
                  </p>
                  <p className="mt-3 text-[9px] font-bold tracking-widest uppercase text-muted-foreground flex items-center justify-center gap-2">
                    Stable Position
                  </p>
                </GlassCard>
              </Link>
            </div>
          )}
        </div>

        {/* 🔍 Search & Filtering */}
        <div className="mt-32 flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
          <div className="flex-1 flex items-center gap-4 rounded-2xl bg-card border border-border/10 px-6 py-4 transition-all focus-within:border-foreground/20 group">
            <Search size={18} className="text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <input
              type="text"
              placeholder="Search by delegate or committee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[11px] font-bold uppercase tracking-widest text-foreground placeholder:text-muted-foreground/40 outline-none"
            />
          </div>
          <div className="flex gap-4">
            <button className="rounded-2xl border border-border/10 px-8 py-4 text-[10px] font-black tracking-widest uppercase text-muted-foreground hover:bg-card hover:text-foreground transition-all active-scale">
              Filter: All Committees
            </button>
            <button className="rounded-2xl border border-border/10 px-8 py-4 text-[10px] font-black tracking-widest uppercase text-muted-foreground hover:bg-card hover:text-foreground transition-all active-scale">
              Sort: Total Score
            </button>
          </div>
        </div>

        {/* 📋 Remaining Standings */}
        <div className="mt-12 space-y-4 max-w-6xl mx-auto">
          <AnimatePresence mode="popLayout">
            {rest.map((entry, idx) => (
              <motion.div
                key={entry.profile_id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <Link href={`/profile/${entry.profile_id}`}>
                  <GlassCard variant="elevated" hover className="flex items-center justify-between p-6 border-border/5 hover:border-foreground/10 group active-scale">
                    <div className="flex items-center gap-8">
                      <span className="font-display font-black text-2xl text-muted-foreground/30 group-hover:text-foreground/20 transition-colors w-10 italic">
                        {String(Math.max(4, entries.findIndex(p => p.profile_id === entry.profile_id) + 1)).padStart(2, "0")}
                      </span>
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full overflow-hidden relative grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 shadow-luxury">
                          <Image
                            src={entry.image_url || "/placeholder.svg"}
                            alt={entry.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-display font-bold text-lg text-foreground uppercase italic tracking-tight group-hover:text-secondary transition-colors">{entry.name}</p>
                          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-1 italic">
                            {entry.committee || "---"} // {entry.sector || "---"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-12">
                      <div className="hidden lg:flex flex-col items-end gap-2 pr-8 border-r border-border/10">
                        <span className="text-[8px] text-muted-foreground/40 uppercase tracking-[0.2em] font-black italic">Consistency</span>
                        <div className="w-32 h-1 bg-border/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "88%" }}
                            className="bg-secondary h-full"
                          />
                        </div>
                      </div>
                      <p className="font-display text-4xl font-black text-foreground tabular-nums tracking-tighter italic w-24 text-right">{entry.total_score}</p>
                      <ChevronRight size={18} className="text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 📈 System Metadata */}
        <div className="mt-20 max-w-6xl mx-auto flex flex-col items-center">
          <button
            onClick={() => setNerdsOpen(!nerdsOpen)}
            className="text-[10px] font-black tracking-[0.5em] uppercase text-muted-foreground hover:text-secondary transition-all flex items-center gap-4 group"
          >
            <div className={cn("transition-transform duration-500", nerdsOpen && "rotate-90")}>
              <Activity size={14} className="group-hover:text-secondary" />
            </div>
            {nerdsOpen ? "HIDE RAW DATA" : "VIEW RAW DATA"}
          </button>
          <AnimatePresence>
            {nerdsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full mt-8 overflow-hidden"
              >
                <GlassCard variant="elevated" className="p-10 border-border/10">
                  <div className="flex items-center gap-4 mb-8 text-secondary/40">
                    <Terminal size={14} />
                    <span className="text-[10px] font-bold tracking-widest uppercase italic">Raw Data Payload</span>
                  </div>
                  <pre className="text-xs text-muted-foreground/60 font-mono overflow-x-auto selection:bg-secondary selection:text-background leading-loose">
                    {JSON.stringify(entries, null, 2)}
                  </pre>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
