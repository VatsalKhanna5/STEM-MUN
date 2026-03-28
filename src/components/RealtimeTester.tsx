"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RealtimeTester() {
  const supabase = createClient();

  useEffect(() => {
    console.log("🔔 Realtime: Subscribing to score_events...");

    const channel = supabase
      .channel("score_events_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "score_events",
        },
        (payload) => {
          console.log("🚀 Realtime: New Score Event Inserted!", payload);
        }
      )
      .subscribe((status) => {
        console.log("📡 Realtime: Subscription status:", status);
      });

    return () => {
      console.log("🔕 Realtime: Cleaning up subscription...");
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-md">
      <p className="text-gray-400 text-sm italic">
        Realtime listener active. Check the browser console for logs...
      </p>
    </div>
  );
}
