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
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const SECTIONS = [
  { id: "session", name: "Live Session", icon: Terminal },
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
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-white selection:text-black">
      {/* 🏛️ ADMIN COMMAND SIDEBAR */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 glass border-r border-white/5 transition-all duration-700 lg:translate-x-0 lg:static flex flex-col",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col px-8 py-12">
          <Link href="/" className="mb-14 group active-scale block">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-sm font-black tracking-[0.4em] text-white uppercase italic group-hover:text-accent transition-all leading-none">THE ARCHIVE</h1>
              <p className="text-[7px] text-white/10 uppercase font-bold tracking-[0.2em] mt-1 ml-0.5">Terminal // Admin v1.0</p>
            </div>
          </Link>

          <nav className="flex-1 space-y-1.5 px-0">
            <div className="px-1 mb-4 flex items-center gap-3 text-white/10">
              <Terminal size={10} />
              <span className="text-[7px] font-black uppercase italic tracking-[0.3em]">System Core</span>
            </div>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={cn(
                    "w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all duration-300 group text-[9px] font-bold uppercase tracking-widest italic active-scale",
                    isActive
                      ? "bg-white text-black shadow-luxury z-10"
                      : "text-white/20 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={14} className={cn(isActive ? "text-black" : "text-white/20 group-hover:text-accent group-hover:scale-110 transition-all")} />
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
      <main className="flex-1 min-w-0 overflow-y-auto bg-black scroll-smooth hide-scrollbar">
        <div className="max-w-[1400px] mx-auto p-12 lg:p-24">
          <div className="flex items-center gap-4 mb-12 opacity-20">
            <Fingerprint size={16} />
            <span className="text-[10px] uppercase font-black italic tracking-widest">Encrypted Session // Verified</span>
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
