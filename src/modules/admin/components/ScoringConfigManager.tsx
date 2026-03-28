"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Settings, Save, Loader2, CheckCircle } from "lucide-react";

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
      // No record found, initialize with defaults
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
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" />
        <span className="uppercase tracking-widest text-xs tracking-tighter">Syncing configuration...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="header space-y-2">
        <h2 className="text-xl font-bold tracking-tight uppercase">Global Event Parameters</h2>
        <p className="text-gray-500 text-xs uppercase tracking-widest">Define the point weights for all scoring events.</p>
      </div>

      <div className="space-y-6 p-8 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* POI Given */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">POI Given</label>
            <input
              type="number"
              value={config?.poi_given}
              onChange={(e) => setConfig({ ...config!, poi_given: parseInt(e.target.value) || 0 })}
              className="w-full bg-black border border-white/20 p-3 rounded-md focus:border-white outline-none transition-all text-xl font-bold"
            />
          </div>

          {/* POI Received */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">POI Received</label>
            <input
              type="number"
              value={config?.poi_received}
              onChange={(e) => setConfig({ ...config!, poi_received: parseInt(e.target.value) || 0 })}
              className="w-full bg-black border border-white/20 p-3 rounded-md focus:border-white outline-none transition-all text-xl font-bold"
            />
          </div>

          {/* POO Penalty */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">POO Penalty</label>
            <input
              type="number"
              value={config?.poo_penalty}
              onChange={(e) => setConfig({ ...config!, poo_penalty: parseInt(e.target.value) || 0 })}
              className="w-full bg-black border border-white/20 p-3 rounded-md focus:border-white outline-none transition-all text-xl font-bold text-red-500"
            />
          </div>

          {/* Speech Max */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Speech Max Score</label>
            <input
              type="number"
              value={config?.speech_max}
              onChange={(e) => setConfig({ ...config!, speech_max: parseInt(e.target.value) || 0 })}
              className="w-full bg-black border border-white/20 p-3 rounded-md focus:border-white outline-none transition-all text-xl font-bold"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 flex items-center justify-center space-x-2 bg-white text-black font-bold p-4 rounded-md uppercase tracking-widest text-xs hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : success ? (
            <CheckCircle className="text-green-600" size={16} />
          ) : (
            <Save size={16} />
          )}
          <span>{saving ? "Deploying..." : success ? "Configuration Applied" : "Save Global Rules"}</span>
        </button>
      </div>

      <div className="flex items-center space-x-2 p-4 border border-white/5 rounded-md text-[9px] text-gray-600 uppercase tracking-[0.3em]">
        <Settings size={12} />
        <span>System defaults to specific constants if reset is required.</span>
      </div>
    </div>
  );
}
