"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export default function Avatar({ 
  src, 
  alt = "User Avatar", 
  size = "md", 
  className,
}: AvatarProps) {
  
  const sizes = {
    xs: "w-8 h-8",
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
    "2xl": "w-64 h-64",
  };

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden bg-surface-container-high flex-shrink-0 group border-2 border-on-surface/10 shadow-luxury active-scale cursor-pointer",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-out"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-container-highest">
           <span className="text-on-surface/10 font-headline font-black uppercase tracking-tighter text-xl">N/A</span>
        </div>
      )}
    </div>
  );
}
