"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, ShieldCheck, Trash2, Loader2, Key, ShieldAlert, Fingerprint, Lock, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/cards/GlassCard";
import { cn } from "@/lib/utils";

interface Judge {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export default function JudgeManager() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchJudges();
  }, []);

  async function fetchJudges() {
    setLoading(true);
    const { data, error } = await supabase
      .from("judges")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setJudges(data);
    }
    setLoading(false);
  }

  async function handleAddJudge(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username || !password) return;
    setAdding(true);

    const newJudge = {
      username: username.toLowerCase().trim(),
      password_hash: password, 
    };

    const { data, error: insertError } = await supabase
      .from("judges")
      .insert([newJudge])
      .select();

    if (!insertError && data) {
      setJudges([data[0], ...judges]);
      setSuccess(true);
      setTimeout(() => {
        setIsAdding(false);
        setSuccess(false);
        setUsername("");
        setPassword("");
      }, 1000);
    } else {
      setError(insertError?.message || "AUTHORIZATION_FAILURE");
    }
    setAdding(false);
  }

  async function handleDeleteJudge(id: string) {
    if(!confirm("Delete this judge?")) return;
    const { error } = await supabase
      .from("judges")
      .delete()
      .eq("id", id);

    if (!error) {
      setJudges(judges.filter(j => j.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-8">
        <div className="w-12 h-12 border-2 border-white/5 border-t-secondary rounded-full animate-spin shadow-luxury" />
        <span className="font-display text-secondary text-[8px] uppercase font-black tracking-widest animate-pulse">Loading Judges</span>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-b border-border/10 pb-10">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <ShieldCheck className="w-3 h-3 text-secondary/40" />
              <span className="font-display text-muted-foreground/40 text-[9px] font-black uppercase tracking-widest italic leading-none">Judge Management</span>
           </div>
           <h2 className="font-display text-5xl font-bold tracking-tighter uppercase italic leading-none text-foreground">JUDGES</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-4 bg-foreground text-background px-12 py-5 rounded-2xl font-display font-black text-[11px] uppercase tracking-widest hover:scale-105 active-scale transition-all shadow-luxury"
        >
          <div className={cn("transition-transform duration-700", isAdding && "rotate-45")}>
             <Plus size={18} />
          </div>
          <span className="leading-none">{isAdding ? "CANCEL" : "ADD JUDGE"}</span>
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
              <GlassCard variant="glass" className="space-y-10 p-12 animate-fade-in group">
                <header className="flex items-center justify-between border-b border-border/10 pb-8">
                  <div className="flex items-center gap-4">
                    <Lock size={18} className="text-secondary/40 group-hover:text-secondary group-hover:scale-110 transition-all duration-700" />
                    <h3 className="font-display text-[10px] uppercase font-black tracking-[0.3em] italic text-foreground">NEW JUDGE</h3>
                  </div>
                </header>

                <form onSubmit={handleAddJudge} className="space-y-10">
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="font-display text-[9px] text-muted-foreground/40 uppercase font-black italic tracking-widest">USERNAME</label>
                      <input
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. jdoe123"
                        className="w-full bg-card-elevated/50 border border-border/10 p-6 rounded-xl text-[12px] uppercase tracking-widest focus:border-foreground/20 outline-none transition-all placeholder:text-muted-foreground/5 font-bold font-display"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="font-display text-[9px] text-muted-foreground/40 uppercase font-black italic tracking-widest">PASSWORD</label>
                      <div className="relative group">
                        <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-secondary transition-colors" size={16} />
                        <input
                          required
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-card-elevated/50 border border-border/10 p-6 pl-16 rounded-xl text-[12px] uppercase tracking-widest focus:border-foreground/20 outline-none transition-all placeholder:text-muted-foreground/5 font-bold font-display"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-destructive text-[9px] uppercase font-black text-center tracking-[0.4em] italic"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={adding}
                    className="w-full bg-foreground text-background font-display font-black p-8 rounded-2xl uppercase tracking-widest text-[11px] hover:scale-[0.98] active-scale transition-all disabled:opacity-50 flex items-center justify-center gap-6 shadow-luxury"
                  >
                    {adding ? <Loader2 className="animate-spin" size={18} /> : success ? <ShieldCheck size={18} /> : <Database size={18} />}
                    <span className="leading-none">{adding ? "SAVING..." : success ? "SAVED" : "SAVE JUDGE"}</span>
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={cn(
          "space-y-6",
          isAdding ? "lg:col-span-7" : "lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 space-y-0"
        )}>
          {judges.map((judge) => (
            <GlassCard 
              key={judge.id} 
              variant="elevated" 
              hover
              className="group relative flex items-center justify-between p-10 border-border/5 hover:border-foreground/10 transition-all duration-1000 active-scale shadow-luxury"
            >
              <div className="flex items-center gap-10">
                <div className="p-5 bg-card rounded-2xl text-muted-foreground/20 group-hover:text-secondary group-hover:bg-secondary/5 transition-all duration-700 shadow-luxury overflow-hidden">
                  <ShieldCheck size={28} />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-display font-bold text-2xl tracking-tighter uppercase italic text-foreground">{judge.username}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary pulse-secondary" />
                    <span className="font-display text-secondary text-[8px] font-black italic uppercase tracking-widest">ACTIVE SESSION</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteJudge(judge.id)}
                className="p-4 text-muted-foreground/20 hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all active-scale"
                title="Revoke access"
              >
                <ShieldAlert size={20} />
              </button>
            </GlassCard>
          ))}

          {judges.length === 0 && !isAdding && (
            <div className="col-span-full py-48 text-center bg-card/30 border border-dashed border-border/10 rounded-[3rem] flex flex-col items-center justify-center gap-12 shadow-luxury outline-none">
              <Key size={64} className="text-muted-foreground/10 animate-pulse" />
              <div className="space-y-4">
                <p className="font-display text-muted-foreground/20 text-[11px] font-black italic uppercase tracking-[0.4em]">NO JUDGES FOUND</p>
                <p className="font-display text-muted-foreground/5 text-[9px] uppercase italic tracking-[0.2em] font-bold">No judges have been added yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
