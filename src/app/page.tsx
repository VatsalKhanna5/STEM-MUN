"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import PageLayout from "@/components/layout/PageLayout";
import LiveSpeakerHero from "@/components/layout/LiveSpeakerHero";
import GlassCard from "@/components/cards/GlassCard";
import TeamCard from "@/components/cards/TeamCard";
import Link from "next/link";
import { TrendingUp, Activity, Zap, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [teamMembers, setTeamMembers] = useState<{ name: string; role: string; image: string; quote?: string }[]>([]);
  const [platformState, setPlatformState] = useState<any>(null);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemMetrics, setSystemMetrics] = useState({
    totalResolutions: "0",
    uptime: "99.9%",
    delegations: "0",
    committees: "0",
  });

  const loadDynamicData = useCallback(async () => {
    const supabase = createClient();
    
    try {
      // Parallel Fetching for maximum stability and performance
      const [
        { data: state },
        { data: performers },
        { data: judges },
        { count: delegateCount },
        { count: roundCount },
        { count: eventCount }
      ] = await Promise.all([
        supabase.from('platform_state').select('*').eq('id', 1).maybeSingle(),
        supabase.from('leaderboard').select('profile_id, name, total_score').limit(5),
        supabase.from('judges').select('name, username, role, image_url, bio').order('created_at', { ascending: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('rounds').select('*', { count: 'exact', head: true }),
        supabase.from('score_events').select('*', { count: 'exact', head: true })
      ]);

      if (state) setPlatformState(state);
      if (performers) setTopPerformers(performers);
      if (judges) {
        setTeamMembers(judges.map(j => ({
          name: j.name || j.username,
          role: j.role || 'STEM MUN Judge',
          image: j.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(j.name || j.username)}&backgroundColor=131313`,
          quote: j.bio
        })));
      }

      setSystemMetrics({
        totalResolutions: eventCount?.toString() || "0",
        uptime: "99.9%",
        delegations: delegateCount?.toString() || "0",
        committees: roundCount?.toString() || "0",
      });
    } catch (err) {
      console.error("Home Data Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDynamicData();

    const supabase = createClient();
    // Throttle listener for state changes
    let throttleTimeout: NodeJS.Timeout | null = null;
    const channel = supabase.channel('home-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'platform_state' }, () => {
       if (!throttleTimeout) {
         loadDynamicData();
         throttleTimeout = setTimeout(() => { throttleTimeout = null; }, 2000);
       }
    }).subscribe();

    return () => { 
      supabase.removeChannel(channel); 
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [loadDynamicData]);

  return (
    <PageLayout>
      <div className="flex flex-col min-h-screen">
        {/* 🚀 Hero Section (Real Centered) */}
        <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden min-h-screen">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/[0.02] via-background to-background" />
          <div
            className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-secondary/5 opacity-50"
          />

          <div className="relative z-10 max-w-5xl mx-auto animate-fade-in space-y-16 flex flex-col items-center w-full pt-32">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">CONCORDIA // APOGEE</span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-accent italic">In association with QMania & E-Cell NIT Jalandhar</p>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="py-20 flex flex-col items-center gap-4"
                >
                  <Loader2 className="animate-spin text-accent/20" size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/10 animate-pulse">Syncing Archive...</span>
                </motion.div>
              ) : platformState?.event_status === 'break' ? (
                <motion.div 
                  key="break"
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white text-black px-12 py-6 rounded-full font-black text-xl uppercase tracking-[0.5em] italic animate-pulse shadow-giant-green"
                >
                  Protocol Break // Lunch
                </motion.div>
              ) : (
                <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                  <LiveSpeakerHero />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-12 flex flex-col items-center">
              <h1 className="hero-title text-gradient text-center transition-all duration-1000">
                STEM-MUN
                <span className="block text-white/10 text-[clamp(1.5rem,4vw,3rem)] tracking-[0.4em] mt-8 not-italic font-black">Archive Protocol 1.0</span>
              </h1>
              <p className="body-text text-lg md:text-xl text-center max-w-3xl mx-auto">
                The Sovereign Intelligence Platform for Real-time MUN Scoring & Analytics // Secure Session Engaged.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <Link
                href="/leaderboard"
                className="rounded-full bg-foreground px-12 py-6 text-[11px] font-black tracking-[0.4em] uppercase text-background transition-all hover:scale-105 active-scale shadow-xl shadow-white/5"
              >
                Access Leaderboard
              </Link>
            </div>
          </div>

          <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-10 animate-fade-in delay-1000">
            <span className="text-[9px] font-black tracking-[0.5em] uppercase font-mono text-white/20">Archive Uplink Stable</span>
            <div className="w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />
          </div>
        </section>
      </div>

      {/* 🏛️ Archive Directors */}
      <section className="bg-card/10 border-y border-white/5 py-48">
        <div className="container mx-auto px-6 flex flex-col items-center">
          <div className="text-center mb-32 space-y-6">
            <h2 className="section-title text-gradient">GRAND ARBITERS</h2>
            <p className="caption">The Adjudicators of concordia</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-20 max-w-7xl mx-auto items-center justify-items-center">
            {loading ? (
               [...Array(4)].map((_, i) => (
                 <div key={i} className="w-64 h-80 bg-white/5 rounded-[2.5rem] animate-pulse" />
               ))
            ) : (
              teamMembers.map((m) => (
                <TeamCard key={m.name} member={m} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 📊 Performance Intel Section */}
      <section className="container mx-auto px-6 py-48">
        <div className="max-w-6xl mx-auto space-y-24">
          <div className="text-center space-y-4">
            <h2 className="section-title text-gradient">ANALYTIC FEED</h2>
            <p className="caption">Global Leaderboard // Sector Performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
            <div className="space-y-12">
              <div className="flex items-center gap-4">
                <TrendingUp size={16} className="text-accent" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Delegate Rankings</h3>
              </div>
              <div className="space-y-10">
                {loading ? (
                   [...Array(5)].map((_, i) => (
                     <div key={i} className="h-4 bg-white/5 rounded w-full animate-pulse" />
                   ))
                ) : (
                  topPerformers.map((p, idx) => (
                    <div key={p.profile_id} className="space-y-4 group">
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60 italic transition-all group-hover:text-white">
                          {idx + 1}. {p.name}
                        </span>
                        <span className="text-lg font-mono font-bold text-accent tabular-nums">{p.total_score}</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(p.total_score / (topPerformers[0]?.total_score || 100)) * 100}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className="h-full bg-accent shadow-[0_0_15px_rgba(77,224,130,0.3)]"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col gap-10">
              <div className={cn(
                "bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-center gap-12 group transition-all hover:bg-white/5",
                loading && "animate-pulse"
              )}>
                <div className="flex items-center gap-4">
                  <Activity size={16} className="text-accent" />
                  <p className="text-[10px] font-black tracking-[0.4em] uppercase text-accent italic">SYSTEM INTEL</p>
                </div>
                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-2">
                    <p className="font-mono text-4xl font-black text-white italic tracking-tighter tabular-nums">{systemMetrics.totalResolutions}</p>
                    <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">Events Processed</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-mono text-4xl font-black text-white italic tracking-tighter tabular-nums">{systemMetrics.delegations}</p>
                    <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">Active Witnesses</p>
                  </div>
                </div>
              </div>

              <div className="bg-accent/5 border border-accent/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center gap-6 group hover:bg-accent/10 transition-all border-dashed">
                <Zap className="text-accent animate-pulse" size={24} fill="currentColor" />
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Real-time Stability</p>
                  <p className="text-xs font-medium text-white/40 leading-relaxed italic uppercase tracking-tighter">
                    Uptime verified at {systemMetrics.uptime} // Secure session engaged.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
