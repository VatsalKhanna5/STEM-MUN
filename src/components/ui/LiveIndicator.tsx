"use client";

import { cn } from "@/lib/utils";

const LiveIndicator = ({ label = "Live Proceedings Ongoing" }: { label?: string }) => (
  <div className="inline-flex items-center gap-3 rounded-full bg-accent/5 border border-accent/10 px-6 py-2 premium-blur cursor-default transition-all duration-700">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40 shadow-luxury" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(77,224,130,0.8)]" />
    </span>
    <span className="text-[9px] font-black tracking-[0.4em] uppercase text-accent italic leading-none">
      {label}
    </span>
  </div>
);

export default LiveIndicator;
