"use client";

import Link from "next/link";
import { Terminal, ShieldCheck, Fingerprint, Activity, Globe, ExternalLink, Network } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="border-t border-border/10 bg-background/50 backdrop-blur-xl relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto px-8 py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-20">
          {/* Logo & Manifesto Section */}
          <div className="md:col-span-5 space-y-10">
            <Link href="/" className="flex items-center gap-4 group hover:scale-[0.98] transition-all max-w-fit">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-background transition-all duration-700">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tighter uppercase italic leading-none text-foreground">STEM MUN</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mt-1">Version 1.0</p>
              </div>
            </Link>
            <p className="text-sm font-medium tracking-tight text-muted-foreground leading-relaxed max-w-md italic opacity-60">
              The definitive scoring terminal for STEM-MUN. A surgically precise interface for the next generation of diplomatic leaders.
            </p>
            <div className="flex items-center gap-6">
               <SocialIcon icon={<Network size={18} />} />
               <SocialIcon icon={<Activity size={18} />} />
               <SocialIcon icon={<Globe size={18} />} />
            </div>
          </div>

          {/* Quick Uplink Links */}
          <div className="md:col-span-2 space-y-8">
            <h4 className="font-display text-[10px] font-black uppercase tracking-[0.5em] text-foreground italic border-l-2 border-secondary pl-4 leading-none text-foreground">Navigation</h4>
            <div className="flex flex-col gap-5 text-sm font-bold uppercase tracking-widest italic text-muted-foreground/60 transition-colors">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/leaderboard">Leaderboard</FooterLink>
              <FooterLink href="/judge/login">Judge Login</FooterLink>
              <FooterLink href="/admin">Admin Panel</FooterLink>
            </div>
          </div>

          {/* Tactical Status Section */}
          <div className="md:col-span-5 space-y-8">
            <h4 className="font-display text-[10px] font-black uppercase tracking-[0.5em] text-foreground italic border-l-2 border-secondary pl-4 leading-none text-foreground">System Status</h4>
            <div className="space-y-6 text-foreground">
              <div className="flex items-center justify-between p-6 bg-card/20 border border-border/5 rounded-2xl group hover:border-secondary/20 transition-all active-scale">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-secondary pulse-secondary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Live Sync</span>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-secondary italic">ONLINE</span>
              </div>
              <div className="flex items-center justify-between p-6 bg-card/20 border border-border/5 rounded-2xl group hover:border-secondary/20 transition-all active-scale opacity-60">
                 <div className="flex items-center gap-4">
                    <Fingerprint size={16} className="text-muted-foreground/20" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Security</span>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic text-foreground">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & System Footnote */}
        <div className="mt-24 pt-12 border-t border-border/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-20 pointer-events-none">
           <div className="flex items-center gap-6">
              <Terminal size={14} className="text-secondary" />
              <p className="text-[10px] font-black uppercase tracking-[1em] italic">STEM MUN 2024</p>
           </div>
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-center italic text-foreground">
              All activities are recorded in real-time. Play fair and respect the delegates.
           </p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="hover:text-secondary hover:translate-x-2 transition-all duration-500 max-w-fit">
    {children}
  </Link>
);

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
  <button className="w-10 h-10 rounded-xl bg-card border border-border/10 flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-foreground hover:text-background transition-all duration-700 active-scale shadow-luxury text-foreground">
    {icon}
  </button>
);

export default Footer;
