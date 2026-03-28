"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Loader2, 
  Search,
  Activity,
  CheckCircle2,
  Minus,
  Plus,
  Terminal,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import PageLayout from "@/components/layout/PageLayout";
import GlassCard from "@/components/cards/GlassCard";
import ProfileCard from "@/components/cards/ProfileCard";
import LiveIndicator from "@/components/ui/LiveIndicator";

interface JudgeSession {
  id: string;
  username: string;
}

interface Profile {
  id: string;
  name: string;
  description: string;
  image_url: string;
  country?: string;
  status?: string;
}

interface Round {
  id: string;
  name: string;
}

interface ScoringConfig {
  poi_given: number;
  poi_received: number;
  poo_penalty: number;
  speech_max: number;
}

export default function JudgeDashboardPage() {
  const [judge, setJudge] = useState<JudgeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeRound, setActiveRound] = useState<Round | null>(null);
  const [activeConfig, setActiveConfig] = useState<ScoringConfig | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Scoring State
  const [remark, setRemark] = useState("");
  const [speechScore, setSpeechScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const session = localStorage.getItem("stem_mun_judge");
    if (session) {
      setJudge(JSON.parse(session));
      fetchData();
    } else {
      router.push("/judge/login"); 
    }
  }, [router]);

  async function fetchData() {
    setLoading(true);
    
    const { data: roundData } = await supabase
      .from("rounds")
      .select("id, name")
      .eq("is_active", true)
      .maybeSingle();
    setActiveRound(roundData);

    const { data: configData } = await supabase
      .from("scoring_config")
      .select("poi_given, poi_received, poo_penalty, speech_max")
      .limit(1)
      .maybeSingle();
    setActiveConfig(configData);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .order("name", { ascending: true });
    if (profileData) setProfiles(profileData);
    
    setLoading(false);
  }

  const addScoreEvent = async (type: "POI_GIVEN" | "POI_RECEIVED" | "POO" | "SPEECH", value: number) => {
    if (isSubmitting || !selectedProfileId || !judge || !activeRound) return; 
    
    setIsSubmitting(true);
    const { error } = await supabase
      .from("score_events")
      .insert([
        {
          profile_id: selectedProfileId,
          judge_id: judge.id,
          round_id: activeRound.id,
          event_type: type,
          value,
          remark: remark.trim() || null
        }
      ]);

    if (!error) {
      setShowSuccess(true);
      if (type === "SPEECH") {
        setSpeechScore(0);
        setRemark("");
      }
      setTimeout(() => setShowSuccess(false), 2000);
    }
    setIsSubmitting(false);
  };

  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 border-2 border-white/5 border-t-secondary rounded-full animate-spin shadow-luxury mb-8" />
        <p className="font-display text-[11px] uppercase tracking-[0.5em] text-secondary animate-pulse italic">Loading Judge Panel...</p>
      </main>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* 📋 Left Sidebar: Delegates Registry */}
          <aside className="lg:w-80 shrink-0 space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-foreground tracking-tight uppercase italic">Delegates</h2>
                <div className="h-px bg-border/20 flex-1 ml-4" />
              </div>
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground italic">
                Session: {activeRound?.name || "STANDBY"}
              </p>
            </div>

            <div className="relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Delegates..."
                className="w-full bg-card/40 border border-border/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:bg-card focus:border-foreground/20 transition-all outline-none placeholder:text-muted-foreground/30"
              />
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
              {filteredProfiles.map((p) => (
                <div key={p.id} onClick={() => setSelectedProfileId(p.id)}>
                   <ProfileCard delegate={p} selected={p.id === selectedProfileId} />
                </div>
              ))}
              {filteredProfiles.length === 0 && (
                <div className="py-20 text-center opacity-20">
                  <Terminal size={32} className="mx-auto mb-4" />
                  <p className="text-[9px] uppercase tracking-widest font-black italic">No Delegates Found</p>
                </div>
              )}
            </div>
          </aside>

          {/* 🎯 Main Content: Command Node */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {selectedProfile && activeConfig ? (
                <motion.div 
                  key={selectedProfile.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <header className="space-y-8">
                    <LiveIndicator label="Live Evaluation" />
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                      <div className="space-y-4">
                        <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-[0.85] uppercase italic tracking-tighter">
                          {selectedProfile.name.split(" ").map((w, i) => <span key={i} className="block">{w}</span>)}
                        </h1>
                        <p className="text-muted-foreground max-w-lg text-lg font-light leading-relaxed">
                          Evaluating performance for <span className="text-foreground font-bold italic">{selectedProfile.description}</span>.
                          Live sync is active.
                        </p>
                      </div>
                      <div className="text-right p-8 bg-card/30 rounded-[2rem] border border-border/10 min-w-[200px]">
                        <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground font-black mb-2 opacity-40">Total Score</p>
                        <p className="font-display text-6xl font-bold text-foreground tabular-nums tracking-tighter italic">---</p>
                      </div>
                    </div>
                  </header>

                  {/* Scoring Grid */}
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {/* Speech Score */}
                    <GlassCard variant="elevated" className="p-10 lg:col-span-2 flex flex-col justify-between">
                      <div className="space-y-8">
                        <div className="flex justify-between items-center">
                          <h3 className="font-display text-lg font-bold tracking-tight uppercase text-foreground italic">Speech Fluidity & Impact</h3>
                          <span className="text-[9px] font-black tracking-widest uppercase text-secondary/40 italic">Coefficient 1.5x</span>
                        </div>
                        <div className="py-6">
                          <input
                            type="range"
                            min="0"
                            max={activeConfig.speech_max}
                            step="1"
                            value={speechScore}
                            onChange={(e) => setSpeechScore(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-border/20 rounded-full appearance-none cursor-pointer accent-secondary transition-all"
                          />
                          <div className="flex justify-between mt-6 text-[9px] font-black tracking-[0.2em] uppercase text-muted-foreground opacity-40 italic">
                            <span>Ineffective</span>
                            <span>Authoritative</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 flex gap-6">
                        <div className="flex-1 p-6 rounded-2xl bg-background/50 border border-border/10 text-center space-y-2 group hover:border-secondary/20 transition-all">
                          <p className="text-[9px] tracking-widest uppercase text-muted-foreground font-bold">Selected Score</p>
                          <p className="font-display text-4xl font-bold text-foreground italic tabular-nums">{speechScore}.0</p>
                        </div>
                        <div className="flex-1 p-6 rounded-2xl bg-background/50 border border-border/10 text-center space-y-2 opacity-30">
                          <p className="text-[9px] tracking-widest uppercase text-muted-foreground font-bold">Average Score</p>
                          <p className="font-display text-4xl font-bold text-foreground italic tabular-nums">---</p>
                        </div>
                      </div>
                    </GlassCard>

                    {/* POI & POO Quick Controls */}
                    <div className="space-y-8">
                      <GlassCard variant="elevated" className="p-8 flex flex-col items-center justify-center gap-6 group hover:border-secondary/20 transition-all">
                        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground opacity-60">Questions Asked</p>
                        <div className="flex items-center gap-8">
                           <button 
                            onClick={() => addScoreEvent("POI_GIVEN", activeConfig.poi_given)} 
                            className="w-16 h-16 rounded-full flex items-center justify-center bg-secondary text-background shadow-luxury hover:scale-110 active-scale transition-all"
                          >
                            <Plus size={24} />
                          </button>
                        </div>
                        <p className="text-[9px] text-secondary font-bold uppercase tracking-widest opacity-40 italic">Add Points</p>
                      </GlassCard>

                      <GlassCard variant="elevated" className="p-8 flex flex-col items-center justify-center gap-6 group hover:border-destructive/20 transition-all">
                        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground opacity-60">Interruptions</p>
                        <div className="flex items-center gap-8">
                           <button 
                            onClick={() => addScoreEvent("POO", activeConfig.poo_penalty)} 
                            className="w-16 h-16 rounded-full flex items-center justify-center bg-card-elevated border border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-all active-scale"
                          >
                            <Plus size={24} />
                          </button>
                        </div>
                        <p className="text-[9px] text-destructive font-bold uppercase tracking-widest opacity-40 italic">Deduct Points</p>
                      </GlassCard>
                    </div>
                  </div>

                  {/* Archival Remarks */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <h3 className="font-display text-xl font-bold text-foreground uppercase italic tracking-tight">Judge Remarks</h3>
                      <div className="h-px bg-border/20 flex-1" />
                    </div>
                    <textarea
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      placeholder="ENTER REMARKS..."
                      rows={5}
                      className="w-full rounded-[2rem] bg-card/30 border border-border/10 p-10 text-lg font-display font-medium text-foreground placeholder:text-muted-foreground/20 outline-none focus:border-foreground/20 transition-all resize-none uppercase tracking-widest"
                    />
                    <div className="flex justify-end items-center gap-8">
                       <button 
                        onClick={() => { setSpeechScore(0); setRemark(""); }}
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground transition-all"
                      >
                        Discard Draft
                      </button>
                      <button 
                        onClick={() => addScoreEvent("SPEECH", speechScore)}
                        disabled={isSubmitting || speechScore === 0}
                        className="rounded-full bg-foreground px-12 py-5 text-[11px] font-black tracking-[0.3em] uppercase text-background transition-all hover:scale-105 active-scale shadow-xl disabled:opacity-20"
                      >
                        Submit Evaluation
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center opacity-20 space-y-12">
                  <ShieldCheck size={120} className="text-foreground animate-pulse" />
                  <div className="space-y-4">
                    <h3 className="text-4xl font-display font-bold uppercase tracking-tighter italic">Judge Panel Standby</h3>
                    <p className="text-[10px] uppercase tracking-[0.5em] font-black italic max-w-sm mx-auto leading-loose">
                      Select a delegate from the list to begin evaluation.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Industrial Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-10 glass border-t border-border/10 flex items-center justify-between px-8 z-50 overflow-hidden">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary italic">System Online</span>
          </div>
          <span className="text-[9px] font-bold tracking-widest text-muted-foreground opacity-40 uppercase font-mono hidden md:block">Latency: 12ms // VERSION 1.0</span>
        </div>
        <div className="flex items-center gap-10">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Judge_ID: {judge?.username || "GUEST"}</span>
          <span className="text-[9px] font-bold tracking-widest text-secondary uppercase animate-fade-in hidden md:block">Session Verified</span>
        </div>
      </div>

      {/* Success Feedback Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-16 right-12 z-[100] glass px-10 py-6 rounded-full border border-secondary/30 flex items-center gap-8 shadow-2xl shadow-secondary/10"
          >
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-secondary text-[11px] uppercase tracking-[0.3em]">Score Saved</span>
              <span className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground opacity-40 italic">The system has recorded the evaluation.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
