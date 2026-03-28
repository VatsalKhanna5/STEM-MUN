"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PageLayout from "@/components/layout/PageLayout";
import LiveIndicator from "@/components/ui/LiveIndicator";
import GlassCard from "@/components/cards/GlassCard";
import TeamCard from "@/components/cards/TeamCard";
import Link from "next/link";
import { TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [teamMembers, setTeamMembers] = useState<{ name: string; role: string; image: string; quote?: string }[]>([]);
  const [systemMetrics, setSystemMetrics] = useState({
    totalResolutions: "...",
    uptime: "99.9%",
    delegations: "...",
    committees: "...",
  });

  useEffect(() => {
    async function loadDynamicData() {
      const supabase = createClient();
      
      const { data: judges } = await supabase
        .from('judges')
        .select('*')
        .order('created_at', { ascending: true });

      if (judges) {
        setTeamMembers(judges.map(j => ({
          name: j.name || j.username,
          role: j.role || 'STEM MUN Judge',
          image: j.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(j.name || j.username)}&backgroundColor=131313`,
          quote: j.bio
        })));
      }

      const { count: delegateCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: roundCount } = await supabase.from('rounds').select('*', { count: 'exact', head: true });
      const { count: eventCount } = await supabase.from('score_events').select('*', { count: 'exact', head: true });

      setSystemMetrics({
        totalResolutions: eventCount?.toString() || "0",
        uptime: "99.9%",
        delegations: delegateCount?.toString() || "0",
        committees: roundCount?.toString() || "0",
      });
    }

    loadDynamicData();
  }, []);

  return (
    <PageLayout>
      {/* 🚀 Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32 md:py-56 overflow-hidden min-h-[90vh]">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-background to-background" />
        <div 
          className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-secondary/10 opacity-50" 
        />
        
        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in space-y-12">
          <LiveIndicator label="Live Proceedings: General Assembly" />
          
          <div className="space-y-6">
            <h1 className="font-display text-6xl md:text-9xl font-bold tracking-tighter leading-[0.85] uppercase">
              <span className="text-gradient">STEM MUN</span>
              <br />
              <span className="text-foreground">Platform</span>
            </h1>
            <p className="mt-8 text-muted-foreground max-w-xl mx-auto text-lg md:text-xl font-light leading-relaxed">
              The official platform for STEM Model United Nations. Real-time scoring, analytics, and oversight.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <Link
              href="/leaderboard"
              className="rounded-full bg-foreground px-10 py-5 text-[11px] font-black tracking-[0.3em] uppercase text-background transition-all hover:scale-105 active-scale shadow-xl shadow-white/5"
            >
              Explore Dashboard
            </Link>
            <button className="rounded-full border border-foreground/20 px-10 py-5 text-[11px] font-black tracking-[0.3em] uppercase text-foreground transition-all hover:bg-foreground hover:text-background active-scale">
              Live Stream
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-20 animate-bounce">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Scroll to Access</span>
          <div className="w-px h-12 bg-foreground" />
        </div>
      </section>

      {/* Removed Event Intel Section as per instructions to remove static unused arrays entirely */}

      {/* 🏛️ Archive Directors */}
      <section className="bg-card/30 border-y border-border/10 py-32 md:py-48">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24 space-y-4">
            <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground tracking-tighter uppercase italic">Our Team</h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.5em] italic">The Team Behind The Platform</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 max-w-6xl mx-auto">
            {teamMembers.map((m) => (
              <TeamCard key={m.name} member={m} />
            ))}
          </div>
        </div>
      </section>

      {/* 📡 System Health Visualization */}
      <section className="container mx-auto px-6 py-32 md:py-48">
        <div className="grid gap-8 md:grid-cols-3">
          <GlassCard variant="elevated" className="p-12 md:col-span-1 space-y-10 group">
            <div className="flex items-center gap-4">
              <Activity size={20} className="text-secondary" />
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-secondary">LIVE DATA</p>
            </div>
            <div className="space-y-2">
              <p className="font-display text-7xl font-bold text-foreground italic group-hover:scale-105 transition-transform duration-700">{systemMetrics.totalResolutions}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">Total resolutions processed.</p>
            </div>
          </GlassCard>
          
          <GlassCard variant="glass" className="p-12 md:col-span-1 space-y-10 border-secondary/10">
            <div className="flex items-center gap-4">
              <TrendingUp size={20} className="text-secondary" />
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-secondary">SYSTEM HEALTH</p>
            </div>
            <div className="space-y-2">
              <p className="font-display text-7xl font-bold text-secondary italic">{systemMetrics.uptime}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">Uptime Stability // ONLINE</p>
            </div>
          </GlassCard>

          <div className="flex flex-col gap-8">
            <GlassCard variant="elevated" className="p-10 text-center flex-1 flex flex-col justify-center items-center gap-4 group">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground group-hover:text-foreground transition-colors">Delegations</p>
              <p className="font-display text-5xl font-bold text-foreground italic">{systemMetrics.delegations}</p>
            </GlassCard>
            <GlassCard variant="elevated" className="p-10 text-center flex-1 flex flex-col justify-center items-center gap-4 group">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground group-hover:text-foreground transition-colors">Committees</p>
              <p className="font-display text-5xl font-bold text-foreground italic">{systemMetrics.committees}</p>
            </GlassCard>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
