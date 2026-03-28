"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "low" | "high" | "glass" | "bright" | "lowest";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  children: React.ReactNode;
}

export default function Card({ 
  variant = "low", 
  padding = "md", 
  hover = false,
  className,
  children,
  ...props 
}: CardProps) {
  
  const paddings = {
    none: "p-0",
    sm: "p-6",
    md: "p-10",
    lg: "p-12",
    xl: "p-16",
  };

  const variants = {
    lowest: "bg-surface-container-lowest",
    default: "bg-surface",
    low: "bg-surface-container-low border border-white/5",
    high: "bg-surface-container-high border border-white/5",
    bright: "bg-surface-bright border border-white/10",
    glass: "glass-card shadow-luxury",
  };

  return (
    <motion.div
      className={cn(
        "rounded-lg transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        variants[variant],
        paddings[padding],
        hover && "hover:scale-[1.02] hover:shadow-luxury hover:bg-white/[0.02] cursor-pointer active-scale",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

