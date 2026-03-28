"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, RotateCcw, Trash2, Loader2, CheckCircle2, Circle, Activity, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/cards/GlassCard";
import { motion, AnimatePresence } from "framer-motion";

interface Round {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export default function RoundManager() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [roundName, setRoundName] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchRounds();
  }, []);

  async function fetchRounds() {
    setLoading(true);
    const { data, error } = await supabase
      .from("rounds")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      setRounds(data);
    }
    setLoading(false);
  }

  async function handleAddRound(e: React.FormEvent) {
    e.preventDefault();
    if (!roundName) return;

    const newRound = { name: roundName, is_active: false };
    const { data, error } = await supabase
      .from("rounds")
      .insert([newRound])
      .select();

    if (!error && data) {
      setRounds([...rounds, data[0]]);
      setRoundName("");
      setIsAdding(false);
    }
  }

  async function toggleRound(id: string) {
    await supabase.from("rounds").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000"); 

    const { error } = await supabase.from("rounds").update({ is_active: true }).eq("id", id);

    if (!error) {
      setRounds(rounds.map(r => ({
        ...r,
        is_active: r.id === id
      })));
    }
  }

  async function handleDeleteRound(id: string) {
    const { error } = await supabase.from("rounds").delete().eq("id", id);
    if (!error) {
      setRounds(rounds.filter(r => r.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-8">
        <div className="w-12 h-12 border-2 border-white/5 border-t-secondary rounded-full animate-spin shadow-luxury" />
        <span className="font-display text-secondary text-[8px] uppercase font-black tracking-widest animate-pulse">Loading Rounds</span>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-b border-border/10 pb-10">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <RotateCcw className="w-3 h-3 text-secondary/40" />
              <span className="font-display text-muted-foreground/40 text-[9px] font-black uppercase tracking-widest italic leading-none">Round Management</span>
           </div>
           <h2 className="font-display text-5xl font-bold tracking-tighter uppercase italic leading-none text-foreground">ROUNDS</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-4 bg-foreground text-background px-12 py-5 rounded-2xl font-display font-black text-[11px] uppercase tracking-widest hover:scale-105 active-scale transition-all shadow-luxury"
        >
          <div className={cn("transition-transform duration-700", isAdding && "rotate-45")}>
             <Plus size={18} />
          </div>
          <span className="leading-none">{isAdding ? "CANCEL" : "NEW ROUND"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          <AnimatePresence>
            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5"
              >
                <GlassCard variant="glass" className="space-y-10 p-12 bg-card-elevated/50 border-border/10 group">
                  <header className="flex items-center justify-between border-b border-border/10 pb-8">
                    <div className="flex items-center gap-4">
                      <Activity size={18} className="text-secondary/40 group-hover:text-secondary group-hover:scale-110 transition-all duration-700" />
                      <h3 className="font-display text-[10px] uppercase font-black tracking-[0.3em] italic text-foreground">NEW ROUND</h3>
                    </div>
                  </header>

                  <form onSubmit={handleAddRound} className="space-y-10">
                    <div className="space-y-4">
                      <label className="font-display text-[9px] text-muted-foreground/40 uppercase font-black italic tracking-widest">ROUND NAME</label>
                      <input
                        required
                        value={roundName}
                        onChange={(e) => setRoundName(e.target.value)}
                        placeholder="e.g. Round 1"
                        className="w-full bg-card/50 border border-border/10 p-6 rounded-xl text-[12px] uppercase tracking-widest focus:border-foreground/20 outline-none transition-all placeholder:text-muted-foreground/5 font-bold font-display"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-foreground text-background font-display font-black p-8 rounded-2xl uppercase tracking-widest text-[11px] hover:scale-[0.98] active-scale transition-all flex items-center justify-center gap-6 shadow-luxury"
                    >
                      <Plus size={18} />
                      <span className="leading-none">SAVE ROUND</span>
                    </button>
                  </form>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={cn(
            "space-y-6",
            isAdding ? "lg:col-span-7" : "lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-10 space-y-0"
          )}>
            {rounds.map((round) => (
              <GlassCard 
                key={round.id} 
                variant={round.is_active ? "glass" : "elevated"}
                hover
                className={cn(
                  "group flex items-center justify-between p-10 border-border/5 hover:border-foreground/10 transition-all duration-1000 shadow-luxury active-scale",
                  round.is_active ? "border-secondary/40 shadow-secondary/5 bg-secondary/[0.02]" : "bg-card-elevated/20"
                )}
              >
                <div className="flex items-center gap-10">
                  <button 
                    onClick={() => toggleRound(round.id)} 
                    className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 active-scale shadow-luxury",
                        round.is_active ? "bg-secondary text-background" : "bg-card text-muted-foreground/20 hover:text-foreground"
                    )}
                  >
                    {round.is_active ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <Circle size={24} />
                    )}
                  </button>
                  <div className="space-y-2">
                    <h3 className={cn("font-display font-bold text-2xl uppercase italic tracking-tighter transition-colors", round.is_active ? "text-foreground" : "text-muted-foreground/60 group-hover:text-foreground")}>{round.name}</h3>
                    <div className="flex items-center gap-3">
                        {round.is_active && <div className="w-2 h-2 rounded-full bg-secondary pulse-secondary" />}
                        <span className={cn(
                            "font-display text-[9px] uppercase font-black tracking-widest italic",
                            round.is_active ? "text-secondary" : "text-muted-foreground/20"
                        )}>
                            {round.is_active ? "ACTIVE ROUND" : "INACTIVE"}
                        </span>
                    </div>
                  </div>
                </div>
                
                {!round.is_active && (
                  <button
                    onClick={() => handleDeleteRound(round.id)}
                    className="p-4 text-muted-foreground/10 hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all active-scale"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </GlassCard>
            ))}

            {rounds.length === 0 && !isAdding && (
              <div className="col-span-full py-48 text-center bg-card/30 border border-dashed border-border/10 rounded-[3rem] flex flex-col items-center justify-center gap-12 shadow-luxury outline-none">
                <RotateCcw size={64} className="text-muted-foreground/10 animate-pulse" />
                <div className="space-y-4">
                  <p className="font-display text-muted-foreground/20 text-[11px] font-black italic uppercase tracking-[0.4em]">NO ROUNDS FOUND</p>
                  <p className="font-display text-muted-foreground/5 text-[9px] uppercase italic tracking-[0.2em] font-bold">Create a round to start.</p>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
