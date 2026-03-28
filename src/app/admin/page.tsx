"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ProfileManager from "@/modules/admin/components/ProfileManager";
import JudgeManager from "@/modules/admin/components/JudgeManager";
import RoundManager from "@/modules/admin/components/RoundManager";
import ScoringConfigManager from "@/modules/admin/components/ScoringConfigManager";

import { motion, AnimatePresence } from "framer-motion";

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
      setError("Incorrect password.");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("stem_mun_admin_auth");
  };

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm"
        >
          <h1 className="text-2xl font-bold mb-6 tracking-tighter">ADMIN ACCESS</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/20 p-3 rounded-md focus:outline-none focus:border-white transition-colors"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-white text-black font-bold p-3 rounded-md hover:bg-gray-200 transition-colors"
            >
              Unlock Dashboard
            </button>
          </form>
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
          <div className="p-12 border border-white/5 bg-white/5 rounded-lg border-dashed">
            <p className="text-gray-600 text-center uppercase tracking-widest text-xs">
              {activeSection} content area coming soon...
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
      <header className="mb-12">
        <motion.h1 
          key={activeSection}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold tracking-tighter uppercase"
        >
          {activeSection}
        </motion.h1>
        <p className="text-gray-500 mt-2">Manage the {activeSection} data for the event.</p>
      </header>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </AdminLayout>
  );
}
