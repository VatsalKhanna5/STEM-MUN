"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, ShieldCheck, Trash2, Loader2, Key } from "lucide-react";

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

    // We'll store it in the password_hash column as plain text for now as requested
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
      setError(insertError?.message || "Error adding judge.");
    }
    setAdding(false);
  }

  async function handleDeleteJudge(id: string) {
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
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" />
        <span className="uppercase tracking-widest text-xs tracking-tighter">Syncing judges...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight uppercase">Judge Panel Access</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
        >
          {isAdding ? <Plus className="rotate-45" size={14} /> : <Plus size={14} />}
          <span>{isAdding ? "Cancel" : "Authorize Judge"}</span>
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAddJudge} className="p-6 border border-white/20 rounded-lg bg-white/5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest">Username</label>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. jdoe_01"
                className="w-full bg-black border border-white/20 p-2 rounded focus:border-white outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest">Initial Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black border border-white/20 p-2 rounded focus:border-white outline-none transition-colors"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-[10px] uppercase font-bold">{error}</p>}
          <button
            type="submit"
            disabled={adding}
            className="w-full bg-white text-black font-bold p-3 rounded-md uppercase tracking-widest text-xs hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            {adding ? "Creating..." : success ? "Authorized!" : "Create Credentials"}
          </button>
        </form>
      )}

      {/* Judges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {judges.map((judge) => (
          <div key={judge.id} className="group relative flex items-center justify-between p-4 border border-white/10 rounded-lg hover:border-white/30 transition-all bg-white/5 overflow-hidden">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/5 rounded-full text-gray-400 group-hover:text-white transition-colors">
                <ShieldCheck size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight">{judge.username}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                  Active
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
               <button
                  onClick={() => handleDeleteJudge(judge.id)}
                  className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                  title="Remove judge"
                >
                  <Trash2 size={16} />
                </button>
            </div>
          </div>
        ))}

        {judges.length === 0 && !isAdding && (
          <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-lg">
            <Key size={32} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500 uppercase tracking-widest text-xs italic">No judges authorized yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
