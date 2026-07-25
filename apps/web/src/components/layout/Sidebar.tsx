"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BarChart3, 
  Play, 
  Cpu, 
  Settings, 
  Zap 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Simulation", href: "/simulation", icon: Play },
  { name: "AI Decisions", href: "/ai-decisions", icon: Cpu },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 text-zinc-300 flex flex-col h-full flex-shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-800">
        <div className="bg-emerald-500 text-zinc-950 p-1.5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]">
          <Zap className="h-5 w-5 fill-current" />
        </div>
        <div>
          <span className="font-bold text-white text-lg tracking-tight">EcoLoop</span>
          <span className="text-zinc-500 text-xs block font-medium -mt-1">BUILDING AGENT</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-zinc-900 border border-zinc-800 text-white shadow-inner" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-zinc-800 text-center">
        <div className="bg-zinc-900/40 rounded-lg p-3 border border-zinc-800/40">
          <div className="text-xs text-zinc-500 font-medium">Running Local Model</div>
          <div className="text-sm font-semibold text-emerald-400 mt-1">Qwen3:8b</div>
        </div>
      </div>
    </aside>
  );
}
