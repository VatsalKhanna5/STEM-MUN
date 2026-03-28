import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "glass";
  hover?: boolean;
}

const GlassCard = ({ children, className, variant = "default", hover = false }: GlassCardProps) => {
  const base = "rounded-2xl transition-all duration-300";
  const variants = {
    default: "bg-card border border-border",
    elevated: "bg-card-elevated border border-border/40 shadow-xl shadow-black/40",
    glass: "glass-card",
  };

  return (
    <div className={cn(base, variants[variant], hover && "card-hover cursor-pointer hover:border-foreground/20", className)}>
      {children}
    </div>
  );
};

export default GlassCard;
