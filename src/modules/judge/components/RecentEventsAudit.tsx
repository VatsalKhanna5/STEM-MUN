"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { History, Zap, Minus, Activity, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      case "POI_GIVEN": return <PlusIcon className="text-white" />;
      case "POI_RECEIVED": return <Zap size={10} className="text-white" />;
      case "POO": return <Minus size={10} className="text-red-500" />;
      case "SPEECH": return <Activity size={10} className="text-blue-500" />;
      default: return null;
    }
  };

  function PlusIcon(props: any) {
    return <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="4" fill="none" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
  }

  return (
    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm space-y-4">
      <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
        <History size={14} className="text-gray-500" />
        <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-white/80">Audit Log (Last 5 Events)</h3>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between text-[10px] py-1"
            >
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                   {getIcon(event.type)}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold uppercase tracking-tight text-white/90">{event.profiles?.name}</span>
                    <span className="text-[8px] text-gray-600 uppercase tracking-widest">{event.type.replace("_", " ")}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-black text-white/50">{event.value > 0 ? `+${event.value}` : event.value}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {events.length === 0 && (
          <p className="text-[9px] text-gray-800 uppercase tracking-widest text-center italic py-4 font-medium">Clear record. No events transmitted.</p>
        )}
      </div>
    </div>
  );
}
