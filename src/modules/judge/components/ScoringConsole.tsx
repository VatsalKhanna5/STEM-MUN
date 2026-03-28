"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Zap, 
  Plus, 
  Minus, 
  MessageSquare, 
  CheckCircle2, 
  Loader2, 
  Activity,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ScoringConsoleProps {
  profileId: string;
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
  judgeId, 
  roundId, 
  config 
}: ScoringConsoleProps) {
  const [remark, setRemark] = useState("");
  const [speechScore, setSpeechScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAction, setLastAction] = useState("");

  const supabase = createClient();

  const addScoreEvent = async (type: "POI_GIVEN" | "POI_RECEIVED" | "POO" | "SPEECH", value: number) => {
    if (isSubmitting) return; // Spam protection
    
    setIsSubmitting(true);
    setLastAction(type);

    const { error } = await supabase
      .from("score_events")
      .insert([
        {
          profile_id: profileId,
          judge_id: judgeId,
          round_id: roundId,
          type,
          value,
          remark: remark.trim() || null
        }
      ]);

    if (!error) {
      setShowSuccess(true);
      if (type === "SPEECH") setSpeechScore(0);
      setRemark(""); // Clear remark input on success
      setTimeout(() => setShowSuccess(false), 1500);
    } else {
       console.error("Scoring failure:", error);
    }
    
    // Brief delay before re-enabling to prevent rapid spam clicks
    setTimeout(() => setIsSubmitting(false), 200);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-black">
        {/* Quick Action: POI Given */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => addScoreEvent("POI_GIVEN", config.poi_given)}
          disabled={isSubmitting}
          className="relative h-44 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:bg-white hover:text-black transition-all group overflow-hidden"
        >
          <Plus size={32} className="group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.2em]">POI Given</p>
            <p className="text-[11px] text-gray-500 group-hover:text-black/50 uppercase tracking-widest font-mono">+{config.poi_given} PTS</p>
          </div>
        </motion.button>

        {/* Quick Action: POI Received */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => addScoreEvent("POI_RECEIVED", config.poi_received)}
          disabled={isSubmitting}
          className="relative h-44 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:bg-white hover:text-black transition-all group overflow-hidden"
        >
          <Zap size={32} className="group-hover:scale-110 transition-transform" />
          <div className="text-center">
             <p className="text-sm uppercase tracking-[0.2em]">POI Received</p>
             <p className="text-[11px] text-gray-500 group-hover:text-black/50 uppercase tracking-widest font-mono">+{config.poi_received} PTS</p>
          </div>
        </motion.button>

        {/* Quick Action: POO Penalty */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => addScoreEvent("POO", config.poo_penalty)}
          disabled={isSubmitting}
          className="relative h-44 bg-red-950/10 border border-red-900/20 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:bg-red-600 hover:text-white transition-all group overflow-hidden"
        >
          <Minus size={32} className="group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.2em]">Order! (POO)</p>
            <p className="text-[11px] text-gray-400 group-hover:text-white/50 uppercase tracking-widest font-mono">{config.poo_penalty} PTS</p>
          </div>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Speech Performance */}
        <div className="p-8 border border-white/5 bg-white/[0.03] rounded-2xl space-y-6">
            <div className="flex items-center space-x-2">
                <Activity size={16} className="text-blue-500" />
                <h3 className="text-xs uppercase tracking-[0.3em] font-black">Speech Performance</h3>
            </div>
            
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest">Score Intensity (0 - {config.speech_max})</label>
                    <span className="text-3xl font-black italic">{speechScore}</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max={config.speech_max}
                  value={speechScore}
                  onChange={(e) => setSpeechScore(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <button
                  onClick={() => addScoreEvent("SPEECH", speechScore)}
                  disabled={isSubmitting || speechScore === 0}
                  className="w-full bg-white text-black font-black p-4 rounded-xl uppercase tracking-widest text-xs hover:bg-gray-200 transition-all disabled:opacity-20"
                >
                  Broadcast Speech Score
                </button>
            </div>
        </div>

        {/* Additional Remarks */}
        <div className="p-8 border border-white/5 bg-white/[0.01] rounded-2xl space-y-6 flex flex-col">
            <div className="flex items-center space-x-2">
                <MessageSquare size={16} className="text-gray-500" />
                <h3 className="text-xs uppercase tracking-[0.3em] font-black">Audit Remark</h3>
            </div>
            <textarea 
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Excellent rebuttal, factual error noted..."
              className="flex-1 bg-black/40 border border-white/5 rounded-xl p-4 text-xs italic outline-none focus:border-white/20 transition-all placeholder:text-gray-800 resize-none min-h-[100px]"
            />
            <p className="text-[9px] text-gray-700 uppercase tracking-widest italic pt-2 font-medium">Remarks will be appended to the next submission.</p>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed bottom-12 right-12 z-50 bg-white text-black px-6 py-4 rounded-full shadow-2xl flex items-center space-x-3 pointer-events-none"
          >
            <CheckCircle2 size={20} />
            <div className="flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-widest">Entry Confirmed</p>
                <p className="text-[9px] uppercase tracking-tighter opacity-60 italic">{lastAction.replace("_", " ")} LOGGED SUCCESSFULY</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
