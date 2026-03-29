"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import ProfileManager from "@/modules/admin/components/ProfileManager";
import JudgeManager from "@/modules/admin/components/JudgeManager";
import RoundManager from "@/modules/admin/components/RoundManager";
import SessionManager from "@/modules/admin/components/SessionManager";
import ScoringConfigManager from "@/modules/admin/components/ScoringConfigManager";
import Card from "@/components/ui/Card";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, ArrowRight, Fingerprint, Activity, Terminal } from "lucide-react";

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState("profiles");
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Middleware handles high-level protection.
  // We can add a simple client check for extra safety if needed.

  const renderContent = () => {
    switch (activeSection) {
      case "session":
        return <SessionManager />;
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
