"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { History, Zap, Minus, Activity, MessageSquare, Plus, ShieldAlert, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RecentEvent {
  id: string;
  type: string;
  value: number;
  created_at: string;
  profiles: {
    name: string;
  };
}

export default function RecentEventsAudit({ judgeId }: { judgeId: string }) {
  const [events, setEvents] = useState<RecentEvent[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!judgeId) return;

    fetchRecentEvents();

    // Set up real-time listener for this judge's score events
    const channel = supabase
      .channel(`judge_events_${judgeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "score_events",
          filter: `judge_id=eq.${judgeId}`,
        },
        () => {
          fetchRecentEvents(); // Refetch on new entry
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [judgeId]);

  async function fetchRecentEvents() {
    const { data } = await supabase
      .from("score_events")
      .select(`
        id,
        type,
        value,
        created_at,
        profiles (
          name
        )
      `)
      .eq("judge_id", judgeId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) setEvents(data as any);
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "POI_GIVEN": return <Plus size={12} className="text-secondary" />;
      case "POI_RECEIVED": return <Zap size={12} className="text-secondary" />;
      case "POO": return <ShieldAlert size={12} className="text-red-500/60" />;
      case "SPEECH": return <Activity size={12} className="text-white/40" />;
      default: return <Terminal size={12} className="text-white/20" />;
    }
  };

  return (
    <div className="bg-surface-container-low/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md space-y-8 shadow-luxury relative overflow-hidden group">
      <div className="flex items-center justify-between border-b border-outline-variant/15 pb-6">
        <div className="flex items-center gap-4">
            <History size={16} className="text-on-surface/20" />
            <h3 className="font-label text-[10px] uppercase tracking-[0.4em] font-black text-white italic">RECENT ACTIVITY</h3>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-secondary pulse-secondary" />
      </div>

      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between group/item"
            >
              <div className="flex items-center gap-5">
                <div className="w-8 h-8 rounded-full bg-surface-container-high border border-white/5 flex items-center justify-center group-hover/item:border-secondary/20 transition-all duration-700 active-scale">
                   {getIcon(event.type)}
                </div>
                <div className="flex flex-col gap-1">
                    <span className="font-headline font-black text-[13px] uppercase italic tracking-tighter text-white group-hover/item:text-secondary transition-colors">{event.profiles?.name}</span>
                    <span className="font-label text-[8px] text-on-surface/20 uppercase tracking-[0.2em] font-bold italic">{event.type.replace("_", " ")}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={cn(
                    "font-mono font-black text-[12px] tracking-widest transition-all duration-700",
                    event.value > 0 ? "text-secondary" : "text-white/20"
                )}>
                    {event.value > 0 ? `+${event.value.toFixed(1)}` : event.value.toFixed(1)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center gap-6 opacity-20">
              <Terminal size={32} />
              <p className="font-label text-[9px] text-on-surface/60 uppercase tracking-[0.3em] text-center italic font-bold">No recent activity.</p>
          </div>
        )}
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    </div>
  );
}
