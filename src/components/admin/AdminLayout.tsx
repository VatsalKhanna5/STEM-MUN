"use client";

import React, { useState } from "react";
import { 
  Users, 
  ShieldCheck, 
  RotateCcw, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const SECTIONS = [
  { id: "profiles", name: "Profiles", icon: Users },
  { id: "judges", name: "Judges", icon: ShieldCheck },
  { id: "rounds", name: "Rounds", icon: RotateCcw },
  { id: "config", name: "Scoring Config", icon: Settings },
];

export default function AdminLayout({ 
  children, 
  activeSection, 
  onSectionChange, 
  onLogout 
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-white text-black rounded-full shadow-lg"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-black border-r border-white/10 transition-transform duration-300 lg:translate-x-0 lg:static",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col p-6">
          <div className="mb-10 px-2">
            <h1 className="text-2xl font-bold tracking-tighter uppercase italic">STEM MUN</h1>
            <p className="text-[10px] text-gray-500 tracking-[0.2em] uppercase mt-1">Admin Dashboard</p>
          </div>

          <nav className="flex-1 space-y-2">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 group text-sm uppercase tracking-wider",
                    isActive 
                      ? "bg-white text-black font-bold" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{section.name}</span>
                </button>
              );
            })}
          </nav>

          <button
            onClick={onLogout}
            className="flex items-center space-x-3 px-4 py-4 mt-auto text-gray-500 hover:text-red-400 transition-colors text-xs uppercase tracking-widest border-t border-white/5"
          >
            <LogOut size={16} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="max-w-7xl mx-auto p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
