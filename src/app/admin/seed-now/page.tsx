"use client";

import { useEffect, useState } from "react";
import { seedJudgesAction, repairSystemStateAction } from "@/modules/admin/actions";
import { seedDelegatesAction } from "@/modules/admin/delegate_seed";
import PageLayout from "@/components/layout/PageLayout";

export default function SeedPage() {
  const [results, setResults] = useState<any[]>([]);
  const [seeding, setSeeding] = useState(false);

  async function runSeed() {
    setSeeding(true);
    const repair = await repairSystemStateAction();
    const judges = await seedJudgesAction();
    const delegates = await seedDelegatesAction();
    const finalResults = [
      { name: "Global System Repair", success: !!repair.success, error: repair.error },
      { name: "40 Delegate Roster Sync", success: delegates.every(d => d.success), error: delegates.find(d => d.error)?.error },
      ...judges
    ];
    setResults(finalResults);
    setSeeding(false);
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-48 px-6 text-center">
        <h1 className="text-4xl font-bold mb-12 uppercase italic tracking-tighter">System Power Sync</h1>
        <button 
          onClick={runSeed}
          disabled={seeding}
          className="bg-white text-black px-12 py-6 rounded-2xl font-black uppercase tracking-widest hover:scale-110 active-scale disabled:opacity-20 transition-all border-4 border-accent animate-pulse"
        >
          {seeding ? "REPAIRING & SYNCING..." : "FIX & SYNC ALL"}
        </button>

        <div className="mt-24 space-y-4 max-w-lg mx-auto">
          {results.map((r, i) => (
            <div key={i} className="flex justify-between p-6 bg-card border border-border/10 rounded-2xl">
              <span className="font-bold text-white/40">{r.name}</span>
              <span className={r.success ? "text-secondary font-black" : "text-destructive font-bold"}>
                {r.success ? "SYNCED" : `FAULT: ${r.error}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
