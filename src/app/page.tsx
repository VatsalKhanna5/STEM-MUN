import Leaderboard from "@/modules/public/components/Leaderboard";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <nav className="relative z-10 flex justify-between items-center p-8 lg:px-12">
         <div className="flex items-center space-x-3">
            <h1 className="text-xl font-black tracking-tighter uppercase italic">STEM MUN</h1>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Live Interface</span>
         </div>
         <div className="flex items-center space-x-6">
            <Link 
              href="/judge/login" 
              className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors flex items-center"
            >
               <ShieldCheck size={12} className="mr-2" />
               Judge Portal
            </Link>
         </div>
      </nav>

      <section className="relative z-10 pt-10 pb-32">
         <Leaderboard />
      </section>

      <footer className="relative z-10 border-t border-white/5 p-8 text-center">
         <p className="text-[8px] text-gray-700 uppercase tracking-[1em]">
            Precision Scoring Environment • STEM MUN 2026
         </p>
      </footer>
    </main>
  );
}
