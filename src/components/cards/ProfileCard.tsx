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
}

const ProfileCard = ({ delegate, selected }: ProfileCardProps) => (
  <Link href={`/profile/${delegate.id}`}>
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 cursor-pointer border active-scale",
        selected
          ? "bg-secondary/10 border-secondary/30 shadow-luxury"
          : "bg-card border-border hover:bg-secondary/5 hover:border-foreground/10"
      )}
    >
      <div className="relative">
        <img
          src={delegate.image_url || "/placeholder.svg"}
          alt={delegate.name}
          className="h-10 w-10 rounded-full object-cover grayscale opacity-80"
          loading="lazy"
          width={40}
          height={40}
        />
        {delegate.status === "speaking" && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-secondary border-2 border-background live-glow" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-foreground truncate uppercase tracking-tight">{delegate.name}</p>
        <p className="text-[9px] tracking-wider uppercase text-muted-foreground truncate italic">{delegate.country || "DELEGATE"}</p>
      </div>
    </div>
  </Link>
);

export default ProfileCard;
