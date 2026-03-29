"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Clock, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpeakerSession {
  current_speaker_id: string | null;
  current_speaker_type: 'delegate' | 'judge';
  speaker_started_at: string | null;
  speaker_duration: number;
  is_active: boolean;
  is_paused: boolean;
  paused_elapsed: number;
  halt_signal: boolean;
  profiles?: {
    name: string;
    description: string;
    image_url: string;
  } | null;
}

export default function LiveSpeakerHero() {
  const [session, setSession] = useState<SpeakerSession | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    fetchState();
    const channel = supabase
      .channel('live-hero-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_state' }, () => {
        fetchState();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session?.is_active && session.speaker_started_at) {
      interval = setInterval(() => {
        if (session.is_paused) {
          setTimerRemaining(Math.max(0, session.speaker_duration - (session.paused_elapsed || 0)));
          return;
        }

        const start = new Date(session.speaker_started_at!).getTime();
        const now = new Date().getTime();
        const elapsedSinceStart = Math.floor((now - start) / 1000);
        const totalElapsed = (session.paused_elapsed || 0) + elapsedSinceStart;
        setTimerRemaining(session.speaker_duration - totalElapsed);
      }, 500);
    } else {
      setTimerRemaining(0);
    }
    return () => clearInterval(interval);
  }, [session]);

  async function fetchState() {
    const { data } = await supabase
      .from("platform_state")
      .select("*, profiles(name, description, image_url)")
      .eq("id", 1)
      .maybeSingle();
    
    setSession(data);
  }

  const formatTime = (seconds: number) => {
    const absSecs = Math.abs(seconds);
    const mins = Math.floor(absSecs / 60);
    const secs = absSecs % 60;
    return `${seconds < 0 ? "-" : ""}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session?.is_active) return null;

  const isOvershooting = timerRemaining < 0 && session.current_speaker_type === 'delegate' && !session.is_paused;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto mb-20"
    >
      <div className={cn(
        "relative rounded-[3rem] p-10 md:p-16 overflow-hidden border transition-all duration-1000",
        isOvershooting 
          ? "bg-red-500/10 border-red-500/30 shadow-2xl shadow-red-500/10" 
          : "bg-white/5 border-white/10 shadow-2xl shadow-accent/5 backdrop-blur-3xl"
      )}>
        {/* Background Accents */}
        <div className={cn(
          "absolute -top-24 -right-24 w-64 h-64 blur-[120px] rounded-full transition-colors",
          isOvershooting ? "bg-red-500/20" : "bg-accent/20"
        )} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Speaker Identity */}
          <div className="flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
            <div className="relative">
              <div className={cn(
                "w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 transition-all duration-700",
                isOvershooting ? "bg-red-500 shadow-giant-red" : "bg-accent shadow-giant-green"
              )}>
                {session.profiles?.image_url ? (
                  <img src={session.profiles.image_url} className="w-full h-full rounded-full object-cover grayscale" alt="Live" />
                ) : (
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <User size={64} className="text-white/20" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-black border border-white/10 p-3 rounded-2xl shadow-xl">
                 <Zap className={cn("w-5 h-5", isOvershooting ? "text-red-500" : "text-accent")} fill="currentColor" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className={cn("w-2 h-2 rounded-full", isOvershooting ? "bg-red-500 animate-pulse" : "bg-accent animate-ping")} />
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.5em] italic",
                  isOvershooting ? "text-red-500" : "text-accent"
                )}>
                  {isOvershooting ? "OVERTIME DETECTED" : "Live Floor Transmission"}
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-sans font-black tracking-tighter uppercase italic leading-none text-white">
                {session.current_speaker_type === 'delegate' ? session.profiles?.name : 'JUDGE / ADMIN'}
              </h2>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/30 italic">
                {session.current_speaker_type === 'delegate' ? session.profiles?.description : 'Active Commentary'}
              </p>
            </div>
          </div>

          {/* Large Countdown */}
          <div className="flex flex-col items-center md:items-end gap-2 text-right">
            {session.halt_signal && (
               <div className="flex items-center gap-3 bg-accent/20 border border-accent/40 px-4 py-2 rounded-full mb-4 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-accent">HALT SIGNAL ACTIVE</span>
               </div>
            )}
            <p className={cn(
                "text-[10px] font-black uppercase tracking-[0.4em] mb-2",
                isOvershooting ? "text-red-500" : "text-white/20"
              )}>
                {session.current_speaker_type === 'judge' ? "NO LIMIT" : "Protocol Timer"}
            </p>
            <div className={cn(
              "font-mono text-8xl md:text-9xl font-black tabular-nums tracking-tighter leading-none transition-colors",
              isOvershooting ? "text-red-500 animate-[pulse_0.5s_infinite]" : "text-white"
            )}>
              {session.current_speaker_type === 'judge' ? "∞" : formatTime(timerRemaining)}
            </div>
            {session.is_paused && (
               <span className="text-[10px] font-black uppercase text-accent bg-accent/10 border border-accent/20 px-4 py-1.5 rounded-full mt-4">
                  Floor Paused
               </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
