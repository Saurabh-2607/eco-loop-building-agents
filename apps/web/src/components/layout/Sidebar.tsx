"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BarChart3, 
  Play, 
  Cpu, 
  Settings 
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
  const { detailedStatus } = useAppStore();

  const statusInfo = (() => {
    switch (detailedStatus) {
      case "initializing":
        return { step: "Loop Setup", substep: "Booting engine threads", color: "bg-violet-500" };
      case "loading_model":
        return { step: "Model Load", substep: "Parsing Chicago Office Standard IDF", color: "bg-violet-500" };
      case "running_energyplus":
        return { step: "EnergyPlus Run", substep: "Simulating HVAC & lights thermal load", color: "bg-emerald-500 animate-pulse" };
      case "collecting_telemetry":
        return { step: "Sensing Telemetry", substep: "Aggregating timeseries zone values", color: "bg-emerald-500 animate-pulse" };
      case "analyzing_data":
        return { step: "AI Analysis", substep: "LangGraph isolating utility load leaks", color: "bg-indigo-500 animate-pulse" };
      case "generating_ai_report":
        return { step: "Report Gen", substep: "Ollama drafting audit report markdown", color: "bg-indigo-500 animate-pulse" };
      case "applying_optimization":
        return { step: "Actuation Update", substep: "Pushing target setpoint changes", color: "bg-sky-500 animate-pulse" };
      case "completed":
        return { step: "System Completed", substep: "Comfort bounds verified", color: "bg-emerald-500" };
      case "failed":
        return { step: "Pipeline Error", substep: "System loop crash", color: "bg-rose-500" };
      default:
        return { step: "System Idle", substep: "Awaiting simulation request", color: "bg-zinc-500" };
    }
  })();

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 text-zinc-300 flex flex-col h-full flex-shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-800">
        <div className="text-white text-base font-bold flex-shrink-0">
          ▲
        </div>
        <div>
          <span className="font-bold text-white text-sm tracking-tight block">EcoLoop</span>
          <span className="text-zinc-500 text-[10px] font-bold font-mono tracking-wider block -mt-1">BUILDING AGENT</span>
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

      {/* Footer Info: Step and Substep Tracker */}
      <div className="p-4 border-t border-zinc-800">
        <div className="bg-zinc-900/40 rounded-lg p-3 border border-zinc-850 space-y-2 text-left">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", statusInfo.color)} />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Step</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white tracking-tight">{statusInfo.step}</div>
            <div className="text-[10px] leading-relaxed text-zinc-500 font-medium">{statusInfo.substep}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

