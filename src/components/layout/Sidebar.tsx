"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: "dashboard" },
    { name: "Delegations", href: "/admin/profiles", icon: "groups" },
    { name: "Scoreboard", href: "/leaderboard", icon: "receipt_long" },
    { name: "Analytics", href: "#", icon: "analytics" },
  ];

  const bottomItems = [
    { name: "Settings", href: "#", icon: "settings" },
    { name: "Support", href: "#", icon: "help_outline" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="hidden md:flex flex-col py-8 px-4 gap-y-6 h-full w-64 border-r border-[#474747]/15 bg-[#131313] font-body font-light tracking-wide shrink-0">
      <div className="px-4 mb-8">
        <div className="text-lg font-black tracking-widest text-white font-headline italic uppercase">ADMIN</div>
        <div className="text-[10px] text-on-surface/40 tracking-[0.2em] uppercase font-bold">STEM MUN v1.0</div>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link 
            key={item.name}
            href={item.href} 
            className={cn(
               "flex items-center gap-3 px-4 py-3 rounded-lg group transition-all duration-300",
               isActive(item.href) 
                ? "text-white font-bold bg-surface-container-high shadow-luxury" 
                : "text-[#e5e2e1]/40 hover:bg-surface-container-low hover:text-white"
            )}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-[11px] uppercase tracking-luxury opacity-100">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-2 pt-6 border-t border-[#474747]/15">
        {bottomItems.map((item) => (
          <Link 
            key={item.name}
            href={item.href} 
            className="flex items-center gap-3 px-4 py-3 text-[#e5e2e1]/40 hover:bg-surface-container-low hover:text-white transition-all duration-300 group"
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-[11px] uppercase tracking-luxury opacity-100">{item.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
