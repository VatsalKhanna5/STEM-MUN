"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Leaderboard", path: "/leaderboard" },
  { label: "Event Info", path: "/#event-info" },
  { label: "Admin Panel", path: "/admin" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-700 border-b",
      scrolled 
        ? "bg-background/80 backdrop-blur-xl border-border/10 py-5" 
        : "bg-transparent border-transparent py-8"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 text-foreground uppercase tracking-widest font-display font-black text-[10px] italic">
        <Link href="/" className="group flex items-center gap-4 hover:scale-105 active-scale transition-all">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center group-hover:bg-secondary group-hover:text-background transition-colors duration-700">
             <ShieldCheck size={18} />
          </div>
          <span className="text-sm font-bold tracking-tighter uppercase leading-none">STEM MUN</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                "relative group transition-all duration-500 hover:text-secondary",
                pathname === link.path ? "text-secondary" : "text-muted-foreground/60"
              )}
            >
              {link.label}
              <motion.div 
                className="absolute -bottom-2 left-0 right-0 h-px bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
                animate={pathname === link.path ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
              />
            </Link>
          ))}
        </div>

        {/* Command Uplink Toggle */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8">
            <div className="h-px w-8 bg-border/20" />
            <Link
              href="/judge/login"
              className="group flex items-center gap-3 hover:text-secondary transition-colors"
            >
              <Fingerprint size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
              <span>Judge Login</span>
            </Link>
          </div>

          <button
            className="md:hidden text-foreground p-2 active-scale"
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-border/10 p-12 space-y-12"
          >
            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-bold tracking-tighter uppercase italic text-muted-foreground hover:text-secondary transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-8 border-t border-border/10">
              <Link
                href="/judge/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between text-sm font-black uppercase tracking-widest italic group text-foreground hover:text-secondary transition-colors"
              >
                <span>Judge Login</span>
                <Fingerprint size={20} className="opacity-20 group-hover:opacity-100" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
