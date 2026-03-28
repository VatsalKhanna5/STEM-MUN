"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { Activity, Clock, Shield, Target, Zap, ChevronLeft, Calendar, Fingerprint, Search } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import LiveIndicator from "@/components/ui/LiveIndicator";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  name: string;
  description: string;
  image_url: string;
  tags: string[];
}

interface ScoreEvent {
  id: string;
  round_number: number;
  event_type: string;
  value: number;
  remark: string;
  created_at: string;
  judges?: {
    name?: string;
    username: string;
    image_url?: string;
  } | null;
}

export default function ProfileDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<ScoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (id) {
      fetchProfileData();
    }
  }, [id]);

  async function fetchProfileData() {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    const { data: eventData } = await supabase
      .from("score_events")
      .select(`
        *,
        judges (name, username, image_url)
      `)
      .eq("profile_id", id)
      .order("created_at", { ascending: false });

    if (profileData) setProfile(profileData);
    if (eventData) setEvents(eventData);
    setLoading(false);
  }

  if (loading) return (
     <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8">
        <div className="w-16 h-16 border-2 border-white/5 border-t-secondary rounded-full animate-spin shadow-luxury" />
        <p className="tracking-luxury text-secondary animate-pulse text-[8px]">Loading Delegate Profile</p>
     </div>
  );
  if (!profile) return <div className="min-h-screen bg-background flex items-center justify-center tracking-luxury text-[10px] opacity-20">DELEGATE_NOT_FOUND</div>;

  const totalScoreVal = events.reduce((sum, e) => sum + e.value, 0);
  const totalScore = totalScoreVal.toFixed(1);
  const [whole, decimal] = totalScore.split(".");

  // Dynamically calculate rounds based on real event data instead of hardcoded mock arrays
  const uniqueRounds = Array.from(new Set(events.map(e => e.round_number))).sort((a,b) => a - b);
  const rounds = uniqueRounds.map(round => {
    const roundEvents = events.filter(e => e.round_number === round);
    const score = roundEvents.reduce((sum, e) => sum + e.value, 0).toFixed(1);
    const remarks = roundEvents.find(e => e.remark)?.remark || "No remarks provided for this round.";
    
    return {
      number: round,
      name: `Round ${round}`,
      score,
      remarks
    };
  });

  return (
    <main className="bg-background text-foreground font-body overflow-x-hidden min-h-screen">
      <Navbar />

      <div className="pt-40 px-12 max-w-[1400px] mx-auto space-y-48 pb-40">
        {/* 🔙 BACK NAV */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-3 tracking-luxury text-white/20 hover:text-white transition-all active-scale group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Go Back</span>
        </button>

        {/* 👤 PROFILE HERO */}
        <section className="flex flex-col lg:flex-row items-start lg:items-end gap-24 border-b border-white/5 pb-24">
          <div className="shrink-0 relative group">
            <Avatar src={profile.image_url} size="xl" className="rounded-[2rem] shadow-luxury" />
            <div className="absolute -bottom-6 -right-6">
              <LiveIndicator />
            </div>
          </div>

          <div className="flex-1 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Fingerprint className="w-4 h-4 text-secondary/40" />
                <span className="tracking-luxury text-foreground/30 text-[9px]">Delegate ID: #{profile.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <h1 className="font-headline text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8]">
                {profile.name}
              </h1>
              {profile.description && (
                <p className="text-lg md:text-xl text-muted-foreground/60 max-w-2xl font-body font-light italic leading-relaxed mt-4">
                  {profile.description}
                </p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4">
              {(profile.tags || []).map(tag => (
                <span key={tag} className="px-6 py-2.5 bg-white/5 rounded-full tracking-luxury text-[8px] border border-white/5 opacity-40 hover:opacity-100 transition-opacity">
                  {tag}
                </span>
              ))}
              <span className="px-6 py-2.5 bg-white text-black rounded-full tracking-luxury text-[8px] font-black">Elite Delegate</span>
            </div>
          </div>

          <div className="hidden xl:flex flex-col items-end gap-4 text-right">
            <span className="tracking-luxury text-foreground/20 text-[9px] font-black">Total Score</span>
            <div className="font-headline text-[120px] font-black tracking-tighter text-white leading-none tabular-nums flex items-baseline">
               {whole}<span className="text-4xl opacity-10 ml-2">.{decimal || "0"}</span>
            </div>
          </div>
        </section>

        {/* 📊 SCORING BREAKDOWN */}
        <div className="space-y-16">
          <div className="flex items-center gap-6">
            <Activity className="w-4 h-4 text-secondary/40" />
            <span className="tracking-luxury text-[9px]">Score Breakdown</span>
          </div>
          
          <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
             {rounds.map((round) => (
               <Card key={round.number} variant="glass" padding="lg" hover className="flex flex-col justify-between min-h-[480px] group active-scale">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <span className="tracking-luxury text-foreground/30 text-[9px]">RND_0{round.number}</span>
                       <Target className="w-4 h-4 text-foreground/10 group-hover:text-secondary transition-colors" />
                    </div>
                    <h3 className="font-headline text-4xl font-extrabold tracking-tight uppercase leading-tight">{round.name}</h3>
                  </div>
                  
                  <div className="py-12 border-y border-white/5 bg-white/[0.01] -mx-10 px-10">
                     <div className="flex items-end gap-3">
                       <span className="font-headline text-8xl font-black text-white tabular-nums tracking-tighter leading-none">{round.score}</span>
                       <span className="tracking-luxury text-[10px] text-foreground/10 mb-2">/ 10.0</span>
                     </div>
                  </div>

                  <p className="font-body text-[11px] text-foreground/30 uppercase tracking-widest font-light leading-relaxed max-w-[280px]">
                    {round.remarks}
                  </p>
               </Card>
             ))}
          </section>
        </div>

        {/* 📡 TELEMETRY TIMELINE */}
        <section className="max-w-4xl mx-auto space-y-24">
          <div className="flex items-center justify-between border-b border-white/5 pb-10">
             <div className="flex items-center gap-6">
               <Zap className="w-4 h-4 text-secondary" />
               <span className="tracking-luxury text-[9px] font-black italic text-secondary">Activity Timeline</span>
             </div>
             <span className="tracking-luxury text-[8px] text-foreground/20 italic">User ID: {profile.id.slice(0, 12)}</span>
          </div>

          <div className="space-y-16">
            {events.length > 0 ? events.map((event) => (
              <div key={event.id} className="flex gap-16 group relative">
                <div className="absolute left-[110px] top-4 bottom-0 w-px bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-24 shrink-0 flex flex-col gap-2">
                  <span className="tracking-luxury text-[8px] text-foreground/20 font-black">
                    {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="h-px w-8 bg-white/5" />
                </div>
                <div className="flex-1 pb-16 border-b border-white/5 group-last:border-none space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        {event.judges?.image_url ? (
                          <img src={event.judges.image_url} alt={event.judges.name || event.judges.username} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <Shield className="w-4 h-4 text-white/40" />
                          </div>
                        )}
                        <span className="tracking-luxury text-[8px] text-foreground/40 font-black italic">
                          JUDGE: {event.judges?.name || event.judges?.username || "UNKNOWN"}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-headline font-bold text-2xl uppercase tracking-tight text-foreground/60 group-hover:text-white transition-all">
                          {event.event_type?.replace(/_/g, ' ') || 'Score Change'}
                        </h4>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-3 h-3 text-foreground/20" />
                          <span className="tracking-luxury text-[7px] text-foreground/20">Round {event.round_number}</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-headline font-black text-5xl text-secondary tabular-nums tracking-tighter italic">+{event.value}</span>
                  </div>
                  <p className="font-body text-[10px] text-foreground/20 uppercase tracking-[0.2em] leading-loose font-light italic max-w-2xl bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                    {event.remark || "Evaluation submitted by judge."}
                  </p>
                </div>
              </div>
            )) : (
              <div className="py-40 text-center bg-white/[0.02] rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-12 shadow-luxury">
                <Clock className="w-16 h-16 text-white/5 animate-pulse" />
                <div className="space-y-4">
                  <p className="tracking-luxury text-foreground/20">No Activity Yet</p>
                  <p className="text-[10px] font-headline text-white/5 uppercase italic tracking-widest">Waiting for delegate activity...</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 🧾 FOOTER */}
      <footer className="w-full py-32 bg-[#0e0e0e] border-t border-white/5 flex flex-col items-center justify-center gap-12">
        <div className="tracking-luxury text-[10px] font-black text-white/10 uppercase italic underline underline-offset-8 decoration-secondary/20">End of Delegate Record</div>
        <div className="tracking-luxury text-[8px] text-foreground/20 px-12 text-center max-w-3xl leading-[2.5] italic">
          All scores are final once recorded. Respect the decisions of the judges.
        </div>
      </footer>
    </main>
  );
}

