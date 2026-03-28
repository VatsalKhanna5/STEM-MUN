"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, 
  Minus, 
  CheckCircle2, 
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Card from "@/components/ui/Card";

interface ScoringConsoleProps {
  profileId: string;
  profileName: string;
  profileDescription: string;
  judgeId: string;
  roundId: string;
  config: {
    poi_given: number;
    poi_received: number;
    poo_penalty: number;
    speech_max: number;
  };
}

export default function ScoringConsole({ 
  profileId, 
  profileName,
  profileDescription,
  judgeId, 
  roundId, 
  config 
}: ScoringConsoleProps) {
  const [remark, setRemark] = useState("");
  const [speechScore, setSpeechScore] = useState(0);
  const [poiCount, setPoiCount] = useState(12); // Mocked but can be backed by events
  const [pooCount, setPooCount] = useState(2); // Mocked but can be backed by events
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const supabase = createClient();

  const addScoreEvent = async (type: "POI_GIVEN" | "POI_RECEIVED" | "POO" | "SPEECH", value: number) => {
    if (isSubmitting) return; 
    
    setIsSubmitting(true);

    const { error } = await supabase
      .from("score_events")
      .insert([
        {
          profile_id: profileId,
          judge_id: judgeId,
          round_id: roundId,
          event_type: type,
          value,
          remark: remark.trim() || null
        }
      ]);

    if (!error) {
      setShowSuccess(true);
      if (type === "SPEECH") setSpeechScore(0);
      if (type === "POI_GIVEN") setPoiCount(prev => prev + 1);
      if (type === "POO") setPooCount(prev => prev + 1);
      
      setRemark(""); 
      setTimeout(() => setShowSuccess(false), 2000);
    }
    
    setTimeout(() => setIsSubmitting(false), 400); 
  };

  return (
    <section className="flex-1 bg-surface flex flex-col overflow-y-auto hide-scrollbar">
        {/* Active Delegate Header */}
        <div className="p-12 pb-6 grid grid-cols-12 gap-8 items-end">
            <div className="col-span-8">
                <div className="font-label text-xs text-secondary uppercase tracking-[0.3em] flex items-center gap-2 mb-4 font-bold">
                    <span className="w-2 h-2 bg-secondary rounded-full pulse-indicator"></span> Active Session
                </div>
                <h1 className="font-headline font-extrabold text-6xl md:text-7xl tracking-tighter text-white uppercase leading-none italic">{profileName}</h1>
                <p className="font-body text-on-surface/40 mt-6 max-w-xl text-lg font-light leading-relaxed">
                    Evaluating performance for <span className="text-white font-bold italic">{profileDescription}</span>.
                </p>
            </div>
            <div className="col-span-4 text-right relative">
                <div className="font-headline font-extrabold text-9xl text-white/[0.03] leading-none absolute -right-4 -top-8 select-none italic uppercase">
                    {profileName.substring(0, 2)}
                </div>
                <div className="relative z-10">
                    <div className="font-label text-[10px] text-on-surface/30 uppercase tracking-[0.2em] mb-2 font-black">Total Score</div>
                    <div className="font-headline font-extrabold text-6xl text-white italic tracking-tighter">84.2</div>
                </div>
            </div>
        </div>

        {/* Scoring Instrument Grid */}
        <div className="px-12 pb-24 grid grid-cols-12 gap-6 mt-8">
            <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-10 rounded-lg flex flex-col justify-between border border-white/5 shadow-luxury">
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-headline font-bold text-xl text-white tracking-tight uppercase italic">Speech Fluidity & Impact</h3>
                        <span className="text-white/20 font-mono text-[10px] tracking-widest font-black uppercase">Coefficient 1.5x</span>
                    </div>
                    <div className="relative py-12">
                        <input 
                            className="w-full h-1 bg-surface-container-high rounded-full appearance-none custom-slider" 
                            max={config.speech_max} min="0" step="1" type="range" 
                            value={speechScore} 
                            onChange={(e) => setSpeechScore(parseInt(e.target.value))}
                        />
                        <div className="flex justify-between mt-6 text-[9px] text-on-surface/30 font-black uppercase tracking-[0.2em] italic">
                            <span>Ineffective</span>
                            <span>Authoritative</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-8">
                    <div className="flex-1 bg-surface-container-high/40 p-4 rounded-xl text-center border border-white/5">
                        <span className="block text-[9px] text-on-surface/20 uppercase tracking-[0.3em] mb-2 font-bold">Selected Score</span>
                        <span className="text-3xl font-headline font-extrabold text-white italic tabular-nums">{speechScore}.0</span>
                    </div>
                    <div className="flex-1 bg-surface-container-high/40 p-4 rounded-xl text-center border border-white/5">
                        <span className="block text-[9px] text-on-surface/20 uppercase tracking-[0.3em] mb-2 font-bold">Average Score</span>
                        <span className="text-3xl font-headline font-extrabold text-white/20 italic tabular-nums">7.8</span>
                    </div>
                </div>
            </div>

            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                {/* POI Counter */}
                <div className="flex-1 bg-surface-container-low p-8 rounded-lg flex flex-col items-center justify-center gap-4 group transition-all hover:bg-surface-container-high border border-white/5">
                    <span className="font-label text-[10px] text-on-surface/40 uppercase tracking-[0.2em] font-black italic">Questions Asked</span>
                    <div className="flex items-center gap-8">
                        <button 
                            onClick={() => setPoiCount(Math.max(0, poiCount - 1))} 
                            className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface/40 hover:text-white hover:bg-surface-bright transition-all active-scale"
                        >
                            <span className="material-symbols-outlined">remove</span>
                        </button>
                        <span className="text-6xl font-headline font-extrabold text-white leading-none italic tabular-nums">{poiCount}</span>
                        <button 
                            onClick={() => addScoreEvent("POI_GIVEN", config.poi_given)} 
                            className="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-on-primary hover:scale-110 shadow-luxury transition-all active-scale"
                        >
                            <span className="material-symbols-outlined font-bold">add</span>
                        </button>
                    </div>
                </div>

                {/* POO Counter */}
                <div className="flex-1 bg-surface-container-low p-8 rounded-lg flex flex-col items-center justify-center gap-4 group transition-all hover:bg-surface-container-high border border-error/5">
                    <span className="font-label text-[10px] text-on-surface/40 uppercase tracking-[0.2em] font-black italic">Interruptions</span>
                    <div className="flex items-center gap-8">
                        <button 
                            onClick={() => setPooCount(Math.max(0, pooCount - 1))} 
                            className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface/40 hover:text-white hover:bg-surface-bright transition-all active-scale"
                        >
                            <span className="material-symbols-outlined">remove</span>
                        </button>
                        <span className="text-6xl font-headline font-extrabold text-error leading-none italic tabular-nums">{pooCount < 10 ? `0${pooCount}` : pooCount}</span>
                        <button 
                            onClick={() => addScoreEvent("POO", config.poo_penalty)} 
                            className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface/40 hover:text-white hover:bg-surface-bright transition-all active-scale"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="col-span-12">
                <div className="bg-surface-container-low p-10 rounded-lg border border-white/5 shadow-luxury">
                    <h3 className="font-headline font-bold text-xl text-white tracking-tight uppercase mb-6 italic">Judge Remarks</h3>
                    <textarea 
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        className="w-full bg-surface-container-highest/20 border-none rounded-lg p-6 text-on-surface placeholder:text-on-surface/10 font-body text-lg focus:ring-1 focus:ring-white min-h-[160px] uppercase tracking-widest font-bold font-headline" 
                        placeholder="ENTER REMARKS..."
                    />
                    <div className="mt-8 flex justify-end gap-4">
                        <button className="px-8 py-4 font-headline font-bold text-[10px] text-on-surface/40 uppercase tracking-widest hover:text-white transition-colors">Discard Draft</button>
                        <button 
                            onClick={() => addScoreEvent("SPEECH", speechScore)}
                            disabled={isSubmitting || speechScore === 0}
                            className="px-12 py-4 bg-white text-on-primary rounded-full font-headline font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active-scale transition-all shadow-luxury disabled:opacity-20"
                        >
                            Submit Evaluation
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Success Feedback Overlay */}
        <AnimatePresence>
            {showSuccess && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed bottom-12 right-12 z-[100] glass-panel px-10 py-6 rounded-full border border-secondary/30 flex items-center gap-8 shadow-luxury"
                >
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-label text-secondary text-[10px] font-black uppercase tracking-widest">Score Saved</span>
                        <span className="font-label text-on-surface/20 text-[7px] uppercase font-bold tracking-widest italic">The system has recorded the evaluation.</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </section>
  );
}
