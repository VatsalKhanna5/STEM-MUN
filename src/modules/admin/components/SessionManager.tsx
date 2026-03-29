"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Play, Square, Clock, User, ChevronRight, Loader2, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import GlassCard from "@/components/cards/GlassCard";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface PlatformState {
  current_speaker_id: string | null;
  current_speaker_type: 'delegate' | 'judge';
  speaker_started_at: string | null;
  speaker_duration: number;
  is_active: boolean;
  is_paused: boolean;
  paused_elapsed: number;
  event_status: 'active' | 'break' | 'adjourned';
  halt_signal: boolean;
}

export default function SessionManager() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [state, setState] = useState<PlatformState | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Selection state
  const [selectedId, setSelectedId] = useState<string>("");
  const [duration, setDuration] = useState<number>(60);
  
  const supabase = createClient();

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('platform_state_admin')
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
    if (state?.is_active && state.speaker_started_at) {
      interval = setInterval(() => {
        if (state.is_paused) {
          setTimerRemaining(Math.max(0, state.speaker_duration - (state.paused_elapsed || 0)));
          return;
        }

        const start = new Date(state.speaker_started_at!).getTime();
        const now = new Date().getTime();
        const elapsedSinceStart = Math.floor((now - start) / 1000);
        const totalElapsed = (state.paused_elapsed || 0) + elapsedSinceStart;
        
        // Count into negative for overshoot
        setTimerRemaining(state.speaker_duration - totalElapsed);
      }, 500);
    } else {
      setTimerRemaining(0);
    }
    return () => clearInterval(interval);
  }, [state]);

  async function fetchData() {
    setLoading(true);
    const { data: profileData } = await supabase.from("profiles").select("id, name, description, image_url").order("name");
    const { data: judgeData } = await supabase.from("judges").select("id, name, image_url").order("name");
    
    if (profileData) setProfiles(profileData);
    if (judgeData) setJudges(judgeData);
    await fetchState();
    setLoading(false);
  }

  async function fetchState() {
    const { data } = await supabase.from("platform_state").select("*").eq("id", 1).maybeSingle();
    setState(data);
    if (data?.current_speaker_id) setSelectedId(data.current_speaker_id);
    if (data?.speaker_duration) setDuration(data.speaker_duration);
  }

  async function handleStart() {
    if (!selectedId) return;
    setSubmitting(true);
    
    // Determine speaker type based on ID presence in lists
    const isJudge = judges.some(j => j.id === selectedId);
    
    // 🔥 FRONTEND OVERRIDE: Start session instantly for the admin
    const now = new Date().toISOString();
    setState(prev => prev ? {
      ...prev,
      current_speaker_id: selectedId,
      current_speaker_type: isJudge ? 'judge' : 'delegate',
      speaker_started_at: now,
      speaker_duration: duration,
      is_active: true,
      is_paused: false,
      paused_elapsed: 0
    } : null);

    const { error } = await supabase
      .from("platform_state")
      .update({
        current_speaker_id: selectedId,
        current_speaker_type: isJudge ? 'judge' : 'delegate',
        speaker_started_at: now,
        speaker_duration: duration,
        is_active: true,
        is_paused: false,
        paused_elapsed: 0,
        updated_at: now
      })
      .eq("id", 1);

    if (error) {
       console.error("Start Error:", error);
       fetchState(); // Revert on failure
    }
    setSubmitting(false);
  }

  async function handlePauseToggle() {
    if (!state) return;
    
    setSubmitting(true);
    const now = new Date();
    const nextPaused = !state.is_paused;
    
    // Optimistic UI Update
    setState({ ...state, is_paused: nextPaused });
    
    try {
      if (!state.is_paused) {
        // PAUSING: Calculate total elapsed so far and store it
        const start = state.speaker_started_at ? new Date(state.speaker_started_at).getTime() : now.getTime();
        const elapsedSinceStart = Math.floor((now.getTime() - start) / 1000);
        const totalElapsed = (state.paused_elapsed || 0) + elapsedSinceStart;
        
        await supabase.from("platform_state").update({
          is_paused: true,
          paused_elapsed: totalElapsed,
          updated_at: now.toISOString()
        }).eq("id", 1);
      } else {
        // RESUMING: Just reset the start time to NOW to continue from current elapsed
        await supabase.from("platform_state").update({
          is_paused: false,
          speaker_started_at: now.toISOString(),
          updated_at: now.toISOString()
        }).eq("id", 1);
      }
    } catch (err) {
      console.error("Pause Error:", err);
      fetchState(); // Revert on failure
    }
    setSubmitting(false);
  }

  async function handleReset() {
    if (!selectedId) return;
    
    setSubmitting(true);
    const now = new Date();
    
    // 🔥 FRONTEND OVERRIDE: Clear local timer state instantly to avoid jumps
    if (state) {
      setState({
        ...state,
        speaker_started_at: now.toISOString(),
        speaker_duration: duration,
        paused_elapsed: 0,
        is_paused: false
      });
    }

    await supabase.from("platform_state").update({
      speaker_started_at: now.toISOString(),
      speaker_duration: duration, // Use the user-defined duration
      paused_elapsed: 0,
      is_paused: false,
      updated_at: now.toISOString()
    }).eq("id", 1);
    
    setSubmitting(false);
  }

  async function handleComplete() {
    if (!state) return;
    setSubmitting(true);
    
    // If it was a delegate, increment their speech count
    if (state.current_speaker_type === 'delegate' && state.current_speaker_id) {
       await supabase.rpc('increment_speech_count', { pid: state.current_speaker_id });
    }

    await supabase.from("platform_state").update({
      is_active: false,
      is_paused: false,
      paused_elapsed: 0,
      updated_at: new Date().toISOString()
    }).eq("id", 1);
    setSubmitting(false);
  }

  async function updateEventStatus(status: 'active' | 'break' | 'adjourned') {
    setSubmitting(true);
    await supabase.from("platform_state").update({
      event_status: status,
      updated_at: new Date().toISOString()
    }).eq("id", 1);
    setSubmitting(false);
  }

  async function toggleHaltSignal() {
    if (!state) return;
    setSubmitting(true);
    await supabase.from("platform_state").update({
      halt_signal: !state.halt_signal,
      updated_at: new Date().toISOString()
    }).eq("id", 1);
    setSubmitting(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="animate-spin text-white/20" size={32} />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-8 space-y-10">
        {/* Event Status Dashboard */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-wrap items-center justify-between gap-8">
           <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-widest text-white/40">Event Protocol</h4>
              <p className="text-[10px] text-white/10 uppercase font-bold tracking-[0.3em]">Current Mode: {state?.event_status}</p>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={toggleHaltSignal}
                className={cn(
                  "px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-3",
                  state?.halt_signal ? "bg-accent/20 border-accent text-accent animate-pulse" : "bg-white/5 border-white/10 text-white/20"
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full", state?.halt_signal ? "bg-accent animate-ping" : "bg-white/20")} />
                Halt Signal
              </button>
              <button 
                onClick={() => updateEventStatus('active')}
                className={cn(
                  "px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                  state?.event_status === 'active' ? "bg-accent text-white border-accent" : "bg-white/5 border-white/10 text-white/20"
                )}
              >
                Normal Operations
              </button>
              <button 
                onClick={() => updateEventStatus('break')}
                className={cn(
                  "px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                  state?.event_status === 'break' ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/20"
                )}
              >
                Lunch Break
              </button>
           </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tighter uppercase italic">Global Session Control</h3>
            <div className={cn(
              "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
              state?.is_active 
                ? "bg-accent/10 border-accent/20 text-accent" 
                : "bg-white/5 border-white/10 text-white/20"
            )}>
              {state?.is_active ? "Live Transmission" : "Standby Mode"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] uppercase font-black tracking-widest text-white/20 ml-2">Select Speaker</label>
              <select 
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-black border border-white/10 p-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-white/20 transition-all appearance-none"
              >
                <option value="">Choose Witness...</option>
                <optgroup label="Delegates" className="bg-black text-white/40">
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.description})</option>
                  ))}
                </optgroup>
                <optgroup label="Judges" className="bg-black text-white/40">
                  {judges.map(j => (
                    <option key={j.id} value={j.id}>{j.name} (Judge)</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase font-black tracking-widest text-white/20 ml-2">Duration (Seconds)</label>
              <div className="relative">
                <input 
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full bg-black border border-white/10 p-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-white/20 transition-all pl-12"
                />
                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={14} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4">
            {!state?.is_active ? (
              <button
                onClick={handleStart}
                disabled={submitting || !selectedId}
                className="flex-1 min-w-[200px] bg-white text-black p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-[0.98] transition-all disabled:opacity-20 active-scale"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <><Play size={16} fill="currentColor" /> Initialize Speech</>}
              </button>
            ) : (
              <>
                 <button
                  onClick={handlePauseToggle}
                  disabled={submitting}
                  className={cn(
                    "flex-1 min-w-[150px] p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 transition-all active-scale",
                    state.is_paused ? "bg-accent text-white" : "bg-white/10 border border-white/10 text-white"
                  )}
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : state.is_paused ? "Resume Session" : "Pause Session"}
                </button>

                <button
                  onClick={handleReset}
                  disabled={submitting}
                  className="px-8 bg-white/5 border border-white/10 text-white/40 p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all active-scale group"
                  title="Reset clock and restart current speaker's turn"
                >
                  <div className="flex items-center gap-3">
                    <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
                    Reset & Restart
                  </div>
                </button>

                <button
                  onClick={handleComplete}
                  disabled={submitting}
                  className="flex-1 min-w-[200px] bg-accent/20 border border-accent/40 text-accent p-5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-accent hover:text-white transition-all active-scale"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : "Finalize & Record"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <GlassCard variant="glass" className="p-8 space-y-6 flex flex-col items-center text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Current Live State</p>
          {state?.is_active && state.current_speaker_id ? (
            <>
              <div className="relative">
                <img 
                  src={profiles.find(p => p.id === state.current_speaker_id)?.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${state.current_speaker_id}`} 
                  className="w-24 h-24 rounded-full border-2 border-accent shadow-luxury object-cover grayscale"
                  alt="Live"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-4 border-black animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black tracking-tighter uppercase italic">
                  {state.current_speaker_type === 'delegate' 
                    ? profiles.find(p => p.id === state.current_speaker_id)?.name 
                    : judges.find(j => j.id === state.current_speaker_id)?.name}
                </h4>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
                  {state.current_speaker_type === 'delegate' ? 'Delegate Profile' : 'Admin / Judge'}
                </p>
                
                <div className={cn(
                  "bg-accent/10 border border-accent/20 rounded-2xl px-6 py-4 mt-6 transition-colors",
                  timerRemaining === 0 && state.is_active && !state.is_paused && "bg-red-500/10 border-red-500/20 animate-pulse border-2"
                )}>
                   <p className={cn(
                     "text-[9px] font-black uppercase tracking-widest mb-1",
                     timerRemaining === 0 && state.is_active && !state.is_paused ? "text-red-500" : "text-accent/60"
                   )}>
                     {timerRemaining === 0 && state.is_active && !state.is_paused ? "OVERSHOOT DETECTED" : "Time Remaining"}
                   </p>
                   <p className={cn(
                     "text-4xl font-mono font-bold tabular-nums",
                     timerRemaining < 0 && state.is_active && !state.is_paused ? "text-red-500 animate-pulse" : "text-accent"
                   )}>
                     {state.current_speaker_type === 'judge' ? "PAUSED" : (
                       <>
                        {timerRemaining < 0 ? "-" : ""}
                        {Math.floor(Math.abs(timerRemaining) / 60).toString().padStart(2, '0')}:
                        {(Math.abs(timerRemaining) % 60).toString().padStart(2, '0')}
                       </>
                     )}
                   </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 space-y-4 opacity-10">
              <User size={48} className="mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest">No Active Speaker</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
