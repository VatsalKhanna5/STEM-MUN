"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  LogOut, 
  ShieldCheck, 
  Loader2, 
  User, 
  ChevronRight, 
  Search,
  Zap,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ScoringConsole from "@/modules/judge/components/ScoringConsole";
import RecentEventsAudit from "@/modules/judge/components/RecentEventsAudit";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface JudgeSession {
  id: string;
  username: string;
}

interface Profile {
  id: string;
  name: string;
  description: string;
  image_url: string;
  tags: string[];
}

interface Round {
  id: string;
  name: string;
}

interface ScoringConfig {
  poi_given: number;
  poi_received: number;
  poo_penalty: number;
  speech_max: number;
}

export default function JudgeDashboardPage() {
  const [judge, setJudge] = useState<JudgeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeRound, setActiveRound] = useState<Round | null>(null);
  const [activeConfig, setActiveConfig] = useState<ScoringConfig | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("stem_mun_judge");
    router.push("/judge/login");
  }, [router]);

  useEffect(() => {
    const session = localStorage.getItem("stem_mun_judge");
    if (session) {
      setJudge(JSON.parse(session));
      fetchData();
    } else {
      router.push("/judge/login");
    }
  }, [router]);

  async function fetchData() {
    setLoading(true);
    
    // 1. Fetch Active Round
    const { data: roundData } = await supabase
      .from("rounds")
      .select("id, name")
      .eq("is_active", true)
      .maybeSingle();
    
    setActiveRound(roundData);

    // 2. Fetch Scoring Config
    const { data: configData } = await supabase
      .from("scoring_config")
      .select("poi_given, poi_received, poo_penalty, speech_max")
      .limit(1)
      .maybeSingle();

    setActiveConfig(configData);

    // 3. Fetch Profiles
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .order("name", { ascending: true });
    
    if (profileData) setProfiles(profileData);
    
    setLoading(false);
  }

  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <Loader2 className="animate-spin text-gray-800 mb-4" size={32} />
        <p className="text-[10px] uppercase tracking-[0.4em] text-gray-700">Initialising Core Modules...</p>
      </main>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white selection:bg-white selection:text-black font-sans overflow-hidden">
      {/* 🚀 TOP BAR */}
      <header className="h-16 border-b border-white/5 bg-black flex items-center justify-between px-6 flex-shrink-0 z-50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 group cursor-default">
            <div className="p-1.5 bg-white/5 border border-white/10 rounded text-white overflow-hidden relative">
               <ShieldCheck size={18} />
               <motion.div 
                 animate={{ opacity: [0.1, 0.4, 0.1] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute inset-0 bg-white"
               />
            </div>
            <h1 className="text-sm font-black tracking-tighter uppercase whitespace-nowrap hidden sm:block">Judge Console</h1>
          </div>
          
          <div className="h-4 w-px bg-white/10" />
          
          <div className="flex items-center space-x-4">
             <div className="flex flex-col">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">OPERATOR</p>
                <p className="text-[11px] font-bold uppercase tracking-tight">{judge?.username}</p>
             </div>
             <div className="h-4 w-px bg-white/10" />
             <div className="flex flex-col">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">ACTIVE SESSION</p>
                <p className="text-[11px] font-bold uppercase tracking-tight text-white/90">
                    {activeRound?.name || "STANDBY"}
                </p>
             </div>
             {activeConfig && (
               <>
                 <div className="h-4 w-px bg-white/10" />
                 <div className="flex flex-col">
                    <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">RULES</p>
                    <p className="text-[10px] font-mono uppercase tracking-tight text-blue-500/80">
                        {activeConfig.poi_given} / {activeConfig.poi_received} / {activeConfig.poo_penalty} / {activeConfig.speech_max}
                    </p>
                 </div>
               </>
             )}
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-[10px] text-gray-500 hover:text-red-400 transition-all uppercase tracking-[0.2em] font-black group"
        >
          <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Terminate</span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* 📋 LEFT PANEL: Profile Selection */}
        <aside className="w-64 sm:w-80 border-r border-white/5 bg-black flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-white/5">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-white transition-colors" size={14} />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Participants..."
                className="w-full bg-white/5 border border-white/10 rounded-md py-2.5 pl-9 pr-4 text-xs focus:bg-white/10 focus:border-white/20 outline-none transition-all placeholder:text-gray-700"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProfileId(p.id)}
                className={cn(
                  "w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 group relative overflow-hidden",
                  selectedProfileId === p.id 
                    ? "bg-white text-black font-bold ring-1 ring-white/20" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center border border-white/10 overflow-hidden",
                  selectedProfileId === p.id ? "grayscale-0 border-black/20" : "grayscale opacity-60"
                )}>
                  <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate uppercase tracking-tight">{p.name}</p>
                  <p className={cn(
                    "text-[10px] truncate uppercase tracking-widest",
                    selectedProfileId === p.id ? "text-black/50" : "text-gray-600"
                  )}>
                    {p.tags[0] || "Delegate"}
                  </p>
                </div>
                {selectedProfileId === p.id && (
                  <ChevronRight size={16} className="text-black" />
                )}
              </button>
            ))}
            
            {filteredProfiles.length === 0 && (
              <div className="text-center py-12 px-4">
                <p className="text-[10px] text-gray-700 uppercase tracking-widest italic font-medium leading-relaxed">No Signal Found in Scanned Bandwidths...</p>
              </div>
            )}
          </div>

          {judge && (
            <div className="p-4 border-t border-white/5">
                <RecentEventsAudit judgeId={judge.id} />
            </div>
          )}
        </aside>

        {/* 🎯 MAIN PANEL: Scoring Controls */}
        <main className="flex-1 min-w-0 bg-black overflow-auto h-full p-8 lg:p-16 flex flex-col items-center justify-center relative">
          <AnimatePresence mode="wait">
            {selectedProfile ? (
              <motion.div 
                key={selectedProfile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-4xl"
              >
                {/* Profile Detail Banner */}
                <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-10 mb-16 border-b border-white/10 pb-12">
                   <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border border-white/10 p-2 group hover:border-white/50 transition-all duration-500">
                      <img 
                        src={selectedProfile.image_url} 
                        className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500"
                        alt={selectedProfile.name}
                      />
                   </div>
                   <div className="text-center md:text-left space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs text-blue-500/80 uppercase tracking-[0.5em] font-black animate-pulse flex items-center justify-center md:justify-start">
                           <Zap size={10} className="mr-2" /> Live Target Selected
                        </p>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic">{selectedProfile.name}</h2>
                      </div>
                      <p className="text-gray-500 text-sm md:text-lg max-w-2xl font-light italic leading-relaxed">{selectedProfile.description}</p>
                   </div>
                </div>

                {/* Scoring Controls */}
                {activeRound && activeConfig && judge ? (
                   <ScoringConsole 
                     profileId={selectedProfile.id}
                     judgeId={judge.id}
                     roundId={activeRound.id}
                     config={activeConfig}
                   />
                ) : !activeRound ? (
                   <div className="py-20 border border-dashed border-red-900/20 rounded-2xl flex flex-col items-center justify-center text-center bg-red-950/5">
                        <Clock size={32} className="text-red-900 mb-4" />
                        <p className="text-[10px] text-red-700 uppercase tracking-widest font-black">Scoring System Offline</p>
                        <p className="text-[9px] text-red-900 uppercase tracking-widest mt-2 px-12">No active round detected. Standby for administrator activation signal.</p>
                   </div>
                ) : (
                   <div className="py-20 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center bg-white/[0.02]">
                       <Loader2 className="animate-spin text-gray-800 mb-4" size={24} />
                       <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Synchronizing Config</p>
                   </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6 max-w-xs"
              >
                <ShieldCheck size={48} className="mx-auto text-gray-900 border border-white/5 p-2 rounded-full" />
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase tracking-widest text-gray-400 leading-tight">Awaiting Selection</h3>
                  <p className="text-[10px] text-gray-700 uppercase tracking-widest italic leading-relaxed font-sans">Initialize target selection from the left panel registry to begin scoring protocol.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Background Ambient Decor */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
             <div className="w-[80%] h-[80%] border border-white/[0.02] rounded-full animate-[spin_60s_linear_infinite]" />
             <div className="absolute w-[60%] h-[60%] border border-white/[0.01] rounded-full animate-[spin_40s_linear_infinite_reverse]" />
          </div>
        </main>
      </div>

      <footer className="h-6 border-t border-white/5 bg-black px-6 flex items-center justify-between text-[8px] text-gray-700 font-mono tracking-widest flex-shrink-0 z-50 uppercase">
        <div className="flex items-center space-x-4">
           <span className="flex items-center"><span className="w-1 h-1 bg-green-500 rounded-full mr-2 animate-pulse" /> Uplink Stable</span>
           <span>Latency: 14ms</span>
        </div>
        <div>System Version 0.9.4-BETA // Secure Encryption Active</div>
      </footer>
    </div>
  );
}
