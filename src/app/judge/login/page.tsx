"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import GlassCard from "@/components/cards/GlassCard";
import { ShieldCheck, Fingerprint, ArrowRight, Loader2 } from "lucide-react";

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
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: username.includes('@') ? username : `${username.toLowerCase().trim()}@stem-mun.com`, // Support username login via mock email if needed
        password,
      });

      if (loginError) throw loginError;

      // Detect role and divert
      const user = data.user;
      const role = user?.app_metadata?.role;

      if (role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/judge/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <section className="min-h-[80vh] flex items-center justify-center px-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-secondary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-foreground/5 blur-[100px] rounded-full" />
        </div>

        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
           className="w-full max-w-md relative z-10 flex flex-col gap-6"
        >
          {/* Navigation Controls */}
          <div className="flex items-center justify-between px-2">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-3 text-[10px] font-black tracking-[0.3em] uppercase text-white/20 hover:text-white transition-all active-scale group"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            <Link 
              href="/"
              className="text-[10px] font-black tracking-[0.3em] uppercase text-white/20 hover:text-white transition-all active-scale"
            >
              Home
            </Link>
          </div>

          <GlassCard variant="glass" className="p-10 md:p-12 border-white/5 shadow-luxury space-y-10">
            <header className="flex flex-col items-center gap-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-luxury transition-transform duration-700 hover:rotate-6 cursor-pointer group">
                <Fingerprint size={24} className="text-white/40 group-hover:text-white transition-colors" />
              </div>
              <div className="space-y-2">
                <h1 className="font-sans text-3xl font-black tracking-tighter uppercase italic leading-none text-white">
                  The Archive
                </h1>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 italic">
                  Authorization Required
                </p>
              </div>
            </header>

            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground italic mb-3 block opacity-60">Username</label>
                  <input
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-card-elevated/50 border border-border/10 hover:border-foreground/20 p-5 rounded-2xl focus:outline-none focus:border-secondary/40 focus:ring-1 focus:ring-secondary/10 transition-all font-display font-bold text-xs uppercase tracking-widest placeholder:text-muted-foreground/20 placeholder:italic"
                    placeholder="Enter Username"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground italic mb-3 block opacity-60">Password</label>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-card-elevated/50 border border-border/10 hover:border-foreground/20 p-5 rounded-2xl focus:outline-none focus:border-secondary/40 focus:ring-1 focus:ring-secondary/10 transition-all font-display font-bold text-xs uppercase tracking-[0.5em] placeholder:text-muted-foreground/20 placeholder:tracking-widest placeholder:italic"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-destructive text-[10px] uppercase font-black text-center tracking-widest pt-2 italic"
                >
                  <span className="opacity-40">ERROR:</span> {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground text-background font-display font-black p-5 rounded-2xl hover:scale-[0.98] transition-all uppercase tracking-[0.3em] text-[11px] shadow-xl flex items-center justify-center gap-4 group disabled:opacity-20 active-scale"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : (
                  <>
                    <span>Login</span>
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
                  </>
                )}
              </button>
            </form>
          </GlassCard>

          <footer className="mt-16 text-center opacity-20 pointer-events-none">
            <p className="text-[9px] font-black uppercase tracking-[1em] italic">
              STEM MUN PLATFORM
            </p>
          </footer>
        </motion.div>
      </section>
    </PageLayout>
  );
}
