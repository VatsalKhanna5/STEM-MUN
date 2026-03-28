"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function JudgeLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("judges")
        .select("*")
        .eq("username", username.toLowerCase().trim())
        .eq("password_hash", password) // Simple plain-text comparison as requested
        .single();

      if (fetchError || !data) {
        throw new Error("Invalid credentials.");
      }

      // Store judge session (simplified)
      localStorage.setItem("stem_mun_judge", JSON.stringify({
        id: data.id,
        username: data.username
      }));

      router.push("/judge/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-white selection:text-black font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <header className="mb-12 text-center">
          <div className="inline-flex p-3 bg-white/5 border border-white/10 rounded-full mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase whitespace-nowrap">Judge Portal</h1>
          <p className="text-gray-500 uppercase tracking-widest text-[9px] mt-2 leading-relaxed">
            Authorized Scoring Personnel Only
          </p>
        </header>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold ml-1">Username</label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-white/10 p-3 rounded-md focus:border-white outline-none transition-all placeholder:text-gray-800"
              placeholder="id_code_00"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold ml-1">Access Token</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-white/10 p-3 rounded-md focus:border-white outline-none transition-all placeholder:text-gray-800"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-[10px] uppercase font-bold text-center tracking-widest pt-2"
            >
              Authentication Failed: {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-white text-black font-black p-4 rounded-md uppercase tracking-[0.2em] text-xs hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Validate Credentials"}
          </button>
        </form>

        <footer className="mt-20 text-center">
            <p className="text-[8px] text-gray-700 uppercase tracking-[0.5em]">STEM Model United Nations • Secure System</p>
        </footer>
      </motion.div>
    </main>
  );
}
