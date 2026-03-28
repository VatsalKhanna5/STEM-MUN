"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ProfileManager from "@/modules/admin/components/ProfileManager";
import JudgeManager from "@/modules/admin/components/JudgeManager";
import RoundManager from "@/modules/admin/components/RoundManager";
import ScoringConfigManager from "@/modules/admin/components/ScoringConfigManager";
import Card from "@/components/ui/Card";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, ArrowRight, Fingerprint, Activity, Terminal } from "lucide-react";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState("profiles");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const HARDCODED_PASSWORD = "admin"; // As requested: quick access control, not prod-ready

  useEffect(() => {
    // Check if previously authenticated in this session
    const auth = localStorage.getItem("stem_mun_admin_auth");
    if (auth === "true") {
      setIsAdmin(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === HARDCODED_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem("stem_mun_admin_auth", "true");
      setError("");
    } else {
      setError("INCORRECT PASSWORD");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("stem_mun_admin_auth");
  };

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-surface text-on-surface p-6 selection:bg-primary selection:text-on-primary overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_100%)] pointer-events-none hero-gradient opacity-40" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg relative z-10"
        >
          <Card variant="glass" className="space-y-16 p-16 border-white/5 shadow-luxury">
            <header className="flex flex-col items-center space-y-8 text-center">
              <div className="w-24 h-24 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center shadow-luxury group relative overflow-hidden">
                 <ShieldCheck size={40} className="text-secondary opacity-20 group-hover:opacity-100 transition-all duration-1000" />
                 <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">ADMIN LOGIN</h1>
                <p className="font-label text-[10px] uppercase tracking-[0.4em] font-black text-on-surface/20 italic">Administrator Portal</p>
              </div>
            </header>

            <form onSubmit={handleLogin} className="space-y-10">
              <div className="space-y-4 relative">
                <div className="flex items-center justify-between px-6">
                   <label className="font-label text-[9px] text-on-surface/20 uppercase font-black italic tracking-widest">Password</label>
                   <Fingerprint size={14} className="text-on-surface/10" />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-white transition-colors" size={16} />
                  <input
                    type="password"
                    placeholder="ENTER PASSWORD..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-lowest/80 border border-white/5 p-10 pl-20 rounded-2xl focus:outline-none focus:border-white/20 focus:bg-white/[0.02] transition-all font-mono tracking-[1em] text-center placeholder:text-white/5 placeholder:tracking-widest placeholder:text-[9px] text-white font-bold"
                    autoFocus
                  />
                </div>
              </div>
              
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500/40 text-[9px] uppercase font-black text-center tracking-[0.4em] italic"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="w-full bg-white text-black font-headline font-black p-10 rounded-2xl hover:bg-white/90 transition-all uppercase tracking-[0.5em] text-[10px] shadow-2xl flex items-center justify-center group active-scale"
              >
                <span>LOGIN TO ADMIN PANEL</span>
                <ArrowRight size={16} className="ml-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </Card>
          
          <div className="flex flex-col items-center gap-6 mt-16 opacity-10 hover:opacity-100 transition-opacity duration-1000">
             <div className="h-px w-24 bg-white/10" />
             <p className="font-label text-[8px] text-on-surface/40 uppercase text-center italic leading-loose font-bold tracking-[0.2em]">
                Authorized Personnel Only
             </p>
          </div>
        </motion.div>
      </main>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "profiles":
        return <ProfileManager />;
      case "judges":
        return <JudgeManager />;
      case "rounds":
        return <RoundManager />;
      case "config":
        return <ScoringConfigManager />;
      default:
        return (
          <div className="py-48 border border-white/5 bg-white/[0.01] rounded-[3rem] border-dashed flex flex-col items-center justify-center gap-8">
            <Terminal className="w-12 h-12 text-white/5 animate-pulse" />
            <p className="font-label text-[10px] uppercase tracking-[0.5em] text-on-surface/10 italic font-black">
              Panel Loading: {activeSection}
            </p>
          </div>
        );
    }
  };

  return (
    <AdminLayout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection} 
      onLogout={handleLogout}
    >
      <header className="mb-24 space-y-4">
        <div className="flex items-center gap-4">
           <div className="w-2 h-2 rounded-full bg-secondary pulse-secondary" />
           <span className="font-label text-[10px] uppercase font-black text-secondary tracking-widest italic leading-none">Admin Session Active</span>
        </div>
        <div className="flex flex-col gap-2">
          <motion.h1 
            key={activeSection}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-7xl font-black tracking-tighter uppercase italic leading-none"
          >
            {activeSection}
          </motion.h1>
          <div className="flex items-center gap-4 mt-2">
              <span className="font-label text-[10px] text-on-surface/20 font-black uppercase tracking-[0.4em] italic leading-none">Admin Dashboard</span>
              <div className="h-px w-24 bg-outline-variant/20" />
              <span className="font-label text-[10px] text-on-surface/10 font-bold uppercase tracking-[0.2em] italic leading-none">Version 1.0</span>
          </div>
        </div>
      </header>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </AdminLayout>
  );
}
