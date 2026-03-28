"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Settings, Save, Loader2, CheckCircle, Database, ShieldCheck, Activity, Terminal, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/cards/GlassCard";

interface ScoringConfig {
  id: string;
  poi_given: number;
  poi_received: number;
  poo_penalty: number;
  speech_max: number;
}

export default function ScoringConfigManager() {
  const [config, setConfig] = useState<ScoringConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    const { data, error } = await supabase
      .from("scoring_config")
      .select("*")
      .limit(1)
      .single();

    if (!error && data) {
      setConfig(data);
    } else if (error && error.code === "PGRST116") {
      const defaultConfig = {
        poi_given: 1,
        poi_received: 2,
        poo_penalty: -1,
        speech_max: 10
      };
      
      const { data: newData, error: insertError } = await supabase
        .from("scoring_config")
        .insert([defaultConfig])
        .select()
        .single();
      
      if (!insertError && newData) {
        setConfig(newData);
      }
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setSuccess(false);

    const { error } = await supabase
      .from("scoring_config")
      .update({
        poi_given: config.poi_given,
        poi_received: config.poi_received,
        poo_penalty: config.poo_penalty,
        speech_max: config.speech_max,
        updated_at: new Date().toISOString()
      })
      .eq("id", config.id);

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-8">
        <div className="w-12 h-12 border-2 border-white/5 border-t-secondary rounded-full animate-spin shadow-luxury" />
        <span className="font-display text-secondary text-[8px] uppercase font-black tracking-widest animate-pulse">Loading Rules</span>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-b border-border/10 pb-10">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <Settings className="w-3 h-3 text-secondary/40" />
              <span className="font-display text-muted-foreground/40 text-[9px] font-black uppercase tracking-widest italic leading-none">Global Rules</span>
           </div>
           <h2 className="font-display text-5xl font-bold tracking-tighter uppercase italic leading-none text-foreground">SCORING RULES</h2>
           <p className="font-display text-muted-foreground/40 text-[10px] uppercase font-bold italic tracking-widest max-w-xl">
              Modify scoring values. Changes take effect immediately.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ConfigItem 
          label="QUESTIONS ASKED" 
          description="Points awarded for asking questions."
          value={config?.poi_given} 
          icon={<Plus size={20} />}
          onChange={(val: number) => setConfig({ ...config!, poi_given: val })}
        />
        <ConfigItem 
          label="QUESTIONS TAKEN" 
          description="Points awarded for taking questions."
          value={config?.poi_received} 
          icon={<Activity size={20} />}
          onChange={(val: number) => setConfig({ ...config!, poi_received: val })}
        />
        <ConfigItem 
          label="INTERRUPTIONS" 
          description="Points deducted for interruptions."
          value={config?.poo_penalty} 
          icon={<ShieldCheck size={20} />}
          isNegative
          onChange={(val: number) => setConfig({ ...config!, poo_penalty: val })}
        />
        <ConfigItem 
          label="SPEECH MAX SCORE" 
          description="Maximum score for a speech."
          value={config?.speech_max} 
          icon={<Settings size={20} />}
          onChange={(val: number) => setConfig({ ...config!, speech_max: val })}
        />
      </div>

      <div className="max-w-xl space-y-12">
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "w-full flex items-center justify-center gap-6 p-10 rounded-3xl font-display font-black text-[12px] uppercase tracking-[0.5em] transition-all duration-1000 shadow-luxury active-scale relative overflow-hidden group border border-border/5",
            success ? "bg-secondary text-background border-secondary" : "bg-foreground text-background hover:opacity-90 transition-opacity"
          )}
        >
          <span className="relative z-10 font-black">
            {saving ? "SAVING..." : success ? "SAVED" : "SAVE RULES"}
          </span>
          {saving ? (
            <Loader2 className="animate-spin relative z-10" size={18} />
          ) : success ? (
             <ShieldCheck className="relative z-10" size={18} />
          ) : (
            <Database className="relative z-10 group-hover:rotate-12 transition-transform" size={18} />
          )}
        </button>
        
        <div className="flex items-center gap-6 p-8 bg-card/30 rounded-[2.5rem] border border-border/10 text-[9px] text-muted-foreground/20 uppercase tracking-[0.3em] font-black italic">
          <Terminal size={16} className="text-secondary/40" />
          <span className="leading-relaxed">All modifications are logged against your administrator credentials.</span>
        </div>
      </div>
    </div>
  );
}

function ConfigItem({ label, value, onChange, icon, description, isNegative = false }: any) {
  return (
    <GlassCard variant="elevated" hover className="group flex flex-col p-12 border-border/5 hover:border-foreground/10 transition-all duration-1000 active-scale shadow-luxury min-h-[320px]">
       <div className="flex-1 space-y-8">
          <div className="flex justify-between items-start">
             <div className="w-14 h-14 rounded-full bg-card border border-border/10 flex items-center justify-center text-muted-foreground/20 group-hover:bg-secondary group-hover:text-background transition-all duration-700 shadow-luxury">
                {icon}
             </div>
             <div className={cn(
               "text-7xl font-display font-bold italic tracking-tighter tabular-nums transition-colors duration-1000 leading-none",
               isNegative ? "text-destructive/40" : "text-foreground group-hover:text-secondary"
             )}>
                {value >= 0 && !isNegative ? "+" : ""}{value}
             </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-display text-[10px] font-black uppercase tracking-[0.4em] italic text-muted-foreground/20 group-hover:text-foreground transition-colors">{label}</h4>
            <p className="font-display text-muted-foreground/40 leading-relaxed text-[11px] uppercase tracking-widest font-bold italic h-8 opacity-40 group-hover:opacity-100 transition-opacity">
              {description}
            </p>
          </div>
       </div>
       
       <div className="flex gap-6 mt-12 pt-10 border-t border-border/10">
          <button 
            onClick={() => onChange(value - 1)}
            className="flex-1 py-6 rounded-2xl bg-card border border-border/5 hover:bg-card-elevated hover:border-border/20 transition-all flex items-center justify-center active-scale group/btn"
          >
             <Minus size={18} className="text-muted-foreground/20 group-hover/btn:text-foreground transition-colors" />
          </button>
          <button 
            onClick={() => onChange(value + 1)}
            className="flex-1 py-6 rounded-2xl bg-card border border-border/5 hover:bg-card-elevated hover:border-border/20 transition-all flex items-center justify-center active-scale group/btn relative"
          >
             <Plus size={18} className="text-muted-foreground/20 group-hover/btn:text-foreground transition-colors" />
          </button>
       </div>
    </GlassCard>
  );
}
