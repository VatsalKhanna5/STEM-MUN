"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, RotateCcw, Trash2, Loader2, CheckCircle2, Circle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    // 1. Deactivate all rounds
    await supabase.from("rounds").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000"); // Update all

    // 2. Activate the selected one
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
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" />
        <span className="uppercase tracking-widest text-xs tracking-tighter">Syncing event rounds...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight uppercase">Session Management</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
        >
          {isAdding ? <Plus className="rotate-45" size={14} /> : <Plus size={14} />}
          <span>{isAdding ? "Cancel" : "Create Round"}</span>
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAddRound} className="p-6 border border-white/20 rounded-lg bg-white/5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest">Round Name</label>
            <input
              required
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              placeholder="e.g. General Debate Phase"
              className="w-full bg-black border border-white/20 p-2 rounded focus:border-white outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-white text-black font-bold p-3 rounded-md uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors"
          >
            Formulate Round
          </button>
        </form>
      )}

      {/* Rounds List */}
      <div className="space-y-3">
        {rounds.map((round) => (
          <div 
            key={round.id} 
            className={cn(
              "flex items-center justify-between p-5 border rounded-lg transition-all",
              round.is_active ? "border-white bg-white/10" : "border-white/10 bg-white/5 opacity-60 hover:opacity-100"
            )}
          >
            <div className="flex items-center space-x-4">
              <button onClick={() => toggleRound(round.id)} className="transition-transform active:scale-95">
                {round.is_active ? (
                  <CheckCircle2 size={24} className="text-white" />
                ) : (
                  <Circle size={24} className="text-gray-600 hover:text-white transition-colors" />
                )}
              </button>
              <div>
                <h3 className="font-bold tracking-tight">{round.name}</h3>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                  {round.is_active ? "Current Live Session" : "Standby"}
                </span>
              </div>
            </div>
            
            {!round.is_active && (
              <button
                onClick={() => handleDeleteRound(round.id)}
                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}

        {rounds.length === 0 && !isAdding && (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-lg">
            <RotateCcw size={32} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500 uppercase tracking-widest text-xs italic">No rounds defined for this event.</p>
          </div>
        )}
      </div>
    </div>
  );
}
