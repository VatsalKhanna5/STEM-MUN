"use client";

import React, { useState } from "react";
import { 
  Users, 
  ShieldCheck, 
  RotateCcw, 
  Settings, 
  LogOut,
  Menu,
  X,
  Fingerprint,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const SECTIONS = [
  { id: "profiles", name: "Delegates", icon: Users },
  { id: "judges", name: "Judges", icon: ShieldCheck },
  { id: "rounds", name: "Rounds", icon: RotateCcw },
  { id: "config", name: "Scoring Rules", icon: Settings },
];

export default function AdminLayout({ 
  children, 
  activeSection, 
  onSectionChange, 
  onLogout 
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-surface text-on-surface font-body overflow-hidden selection:bg-primary selection:text-on-primary">
      {/* 🏛️ ADMIN COMMAND SIDEBAR */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 bg-surface-container-lowest border-r border-outline-variant/15 transition-all duration-700 lg:translate-x-0 lg:static flex flex-col",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col p-10">
          <div className="mb-16 px-4">
            <h1 className="text-2xl font-black tracking-widest text-white uppercase font-headline italic">ADMIN</h1>
            <p className="tracking-luxury text-on-surface/20 text-[9px] mt-2 uppercase italic font-black">Admin Panel // Version 1.0</p>
          </div>

          <nav className="flex-1 space-y-3">
             <div className="px-6 mb-6 flex items-center gap-4 text-on-surface/20">
                <Terminal size={14} />
                <span className="tracking-luxury text-[8px] font-black uppercase italic">Dashboard</span>
             </div>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={cn(
                    "w-full flex items-center space-x-5 px-6 py-5 rounded-2xl transition-all duration-500 group text-[11px] font-headline uppercase tracking-[0.2em] font-black italic active-scale",
                    isActive 
                      ? "bg-white text-black shadow-luxury z-10" 
                      : "text-on-surface/30 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={18} className={cn(isActive ? "text-black" : "text-on-surface/20 group-hover:text-secondary group-hover:scale-110 transition-all")} />
                  <span>{section.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-10 border-t border-outline-variant/15">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-5 px-6 py-6 bg-white/[0.02] border border-white/5 rounded-2xl text-on-surface/20 hover:text-red-400 hover:border-red-400/20 transition-all duration-500 text-[10px] uppercase tracking-[0.3em] font-headline font-black italic group active-scale"
            >
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 📄 MAIN EVALUATION CORE */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-surface scroll-smooth hide-scrollbar">
        <div className="max-w-[1400px] mx-auto p-12 lg:p-24">
            <div className="flex items-center gap-4 mb-12 opacity-40">
                <Fingerprint size={16} />
                <span className="tracking-luxury text-[10px] uppercase font-black italic">Admin Access Verified</span>
            </div>
          {children}
        </div>
      </main>

      {/* 📱 MOBILE SIDEBAR TOGGLE */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-8 right-8 z-50 p-6 bg-white text-black rounded-full shadow-2xl active-scale transition-all border border-black/10"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
}
