"use client";

import { cn } from "@/lib/utils";

const LiveIndicator = ({ label = "Live Proceedings Ongoing" }: { label?: string }) => (
  <div className="inline-flex items-center gap-3 rounded-full bg-secondary/10 border border-secondary/20 px-5 py-2 group cursor-default transition-all duration-700">
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-40" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(77,224,130,0.6)]" />
    </span>
    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-secondary italic leading-none">
      {label}
    </span>
  </div>
);

export default LiveIndicator;
