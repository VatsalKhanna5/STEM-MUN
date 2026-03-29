"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  delegate: {
    id: string;
    name: string;
    image_url?: string;
    country?: string;
    status?: string;
  };
  selected?: boolean;
  onClick?: () => void;
}

const ProfileCard = ({ delegate, selected, onClick }: ProfileCardProps) => {
  const content = (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 rounded-3xl p-4 transition-all duration-500 cursor-pointer border active-scale group",
        selected
          ? "bg-secondary/10 border-secondary/30 shadow-luxury"
          : "bg-surface-container-low border-white/5 hover:bg-surface-container-high hover:border-white/10"
      )}
    >
      <div className="relative shrink-0">
        <img
          src={delegate.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(delegate.name)}&backgroundColor=131313`}
          alt={delegate.name}
          className="h-12 w-12 rounded-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 shadow-luxury border border-white/5"
          loading="lazy"
        />
        {delegate.status === "speaking" && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-accent border-2 border-background live-glow" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-foreground truncate uppercase tracking-tight">{delegate.name}</p>
        <p className="text-[9px] tracking-wider uppercase text-muted-foreground truncate italic">{delegate.country || "DELEGATE"}</p>
      </div>
    </div>
  );

  if (onClick) return content;
  return <Link href={`/profile/${delegate.id}`}>{content}</Link>;
};

export default ProfileCard;
