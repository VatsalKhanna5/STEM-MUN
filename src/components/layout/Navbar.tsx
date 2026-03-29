"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, Shield, Fingerprint, Clock, User } from "lucide-react";

interface SpeakerSession {
  current_speaker_id: string | null;
  current_speaker_type: 'delegate' | 'judge';
  speaker_started_at: string | null;
  speaker_duration: number;
  is_active: boolean;
  is_paused: boolean;
  paused_elapsed: number;
  halt_signal: boolean;
  profiles?: {
    name: string;
    description: string;
    image_url: string;
  } | null;
}

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Leaderboard", path: "/leaderboard" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState<SpeakerSession | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    fetchState();

    // Listen for global state changes
    const stateChannel = supabase
      .channel('platform-state-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_state' }, () => {
        fetchState();
      })
      .subscribe();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      supabase.removeChannel(stateChannel);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session?.is_active && session.speaker_started_at) {
      interval = setInterval(() => {
        if (session.is_paused) {
          setTimerRemaining(Math.max(0, session.speaker_duration - (session.paused_elapsed || 0)));
          return;
        }

        const start = new Date(session.speaker_started_at!).getTime();
        const now = new Date().getTime();
        const elapsedSinceStart = Math.floor((now - start) / 1000);
        const totalElapsed = (session.paused_elapsed || 0) + elapsedSinceStart;
        setTimerRemaining(session.speaker_duration - totalElapsed);
      }, 500);
    } else {
      setTimerRemaining(0);
    }
    return () => clearInterval(interval);
  }, [session]);

  async function fetchState() {
    const { data } = await supabase
      .from("platform_state")
      .select("*, profiles(name, description, image_url)")
      .eq("id", 1)
      .maybeSingle();
    
    setSession(data);
  }

  const formatTime = (seconds: number) => {
    const absSecs = Math.abs(seconds);
    const mins = Math.floor(absSecs / 60);
    const secs = absSecs % 60;
    return `${seconds < 0 ? "-" : ""}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <nav className={cn(
      "fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-7xl transition-all duration-700",
      scrolled ? "top-4" : "top-6"
    )}>
      <div className={cn(
        "glass-premium rounded-full px-8 py-3 flex items-center justify-between transition-all duration-700 shadow-luxury",
        scrolled ? "py-3" : "py-4"
      )}>
        {/* LEFT: Branding */}
        <Link href="/" className="flex items-center gap-3 active-scale group">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
            <Shield size={16} />
          </div>
          <span className="font-display font-black text-sm tracking-tighter uppercase text-gradient">The Archive</span>
        </Link>

        {/* CENTER: Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "relative text-[11px] font-black uppercase tracking-widest transition-all duration-500 hover:text-white",
                  isActive ? "text-white" : "text-white/40"
                )}
              >
                {link.label}
                {isActive && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-white"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* RIGHT: Live Data & Login */}
        <div className="flex items-center gap-6">
          <AnimatePresence>
            {session?.is_active && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                className="hidden lg:flex items-center gap-6"
              >
                 {/* Prominent Timer */}
                 <div className={cn(
                   "flex items-center gap-4 rounded-2xl px-6 py-2 shadow-luxury transition-all duration-500",
                   timerRemaining < 0 && session.current_speaker_type === 'delegate' && !session.is_paused
                    ? "bg-red-500/20 border-red-500/40 animate-pulse"
                    : "bg-accent/10 border-accent/20 accent-glow"
                 )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      timerRemaining < 0 && session.current_speaker_type === 'delegate' && !session.is_paused ? "bg-red-500" : "bg-accent",
                      session.halt_signal && "ring-4 ring-accent/30 animate-pulse-soft"
                    )} />
                    <span className={cn(
                      "text-xl font-mono font-bold tabular-nums tracking-tighter",
                      timerRemaining < 0 && session.current_speaker_type === 'delegate' && !session.is_paused ? "text-red-500" : "text-accent"
                    )}>
                      {session.current_speaker_type === 'judge' ? "PAUSED" : formatTime(timerRemaining)}
                    </span>
                 </div>

                 {/* Speaker Brief */}
                 <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pl-1.5 pr-5 py-1.5 hover:bg-white/10 transition-colors">
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-black text-white uppercase truncate max-w-[100px] leading-none mb-1">
                        {session.current_speaker_type === 'delegate' ? session.profiles?.name : 'Judge / Admin'}
                      </span>
                      <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest leading-none">
                        {session.current_speaker_type === 'delegate' ? session.profiles?.description : 'Floor Held'}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 overflow-hidden">
                       {(session.current_speaker_type === 'delegate' && session.profiles?.image_url) ? (
                         <img src={session.profiles.image_url} className="w-full h-full object-cover" alt="Speaker" />
                       ) : (
                         <User size={14} className="text-white/20" />
                       )}
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          <Link
            href="/judge/login"
            className="group flex items-center gap-3 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 px-6 py-2 rounded-full transition-all duration-500 active-scale"
          >
            <Fingerprint size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            <span className="text-[10px] font-black uppercase tracking-widest">Login</span>
          </Link>

          <button
            className="md:hidden text-white/60 p-1 active-scale"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="md:hidden mt-4 glass rounded-[2rem] p-8 border border-white/10 shadow-luxury overflow-hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "text-xl font-black uppercase tracking-tighter transition-all",
                    pathname === link.path ? "text-white" : "text-white/20"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px w-full bg-white/5 my-2" />
              <Link
                href="/judge/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between group"
              >
                <span className="text-sm font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Judge Access</span>
                <Fingerprint size={20} className="text-white/20 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
