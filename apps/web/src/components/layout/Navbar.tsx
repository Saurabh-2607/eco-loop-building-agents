"use client";

import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { Play, Pause, Cpu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Navbar() {
  const pathname = usePathname();
  const { 
    simState, 
    triggerLiveOptimization, 
    optimizationLoading, 
    startSimulation, 
    setSimStatus 
  } = useAppStore();

  // Determine current page name
  const pageTitle = (() => {
    switch (pathname) {
      case "/":
        return "Dashboard Overview";
      case "/analytics":
        return "Performance Analytics";
      case "/simulation":
        return "EnergyPlus Runtime Control";
      case "/ai-decisions":
        return "AI Decisions Timeline";
      case "/settings":
        return "System Settings";
      default:
        return "EcoLoop Building Agents";
    }
  })();

  const isRunning = simState.status === "running";
  const runId = simState.runId;

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8 select-none flex-shrink-0">
      {/* Title */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-8 w-8 text-zinc-500" />
        <h1 className="font-semibold text-sm tracking-tight text-foreground">{pageTitle}</h1>
      </div>


      {/* Simulator Controls & Badges */}
      <div className="flex items-center gap-4">
        {/* Simulator Status */}
        <div className="flex items-center gap-2 mr-2">
          <span className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-widest">Simulator:</span>
          <Badge 
            variant="outline"
            className={cn(
              "font-mono uppercase text-[10px] px-2 py-0.5 rounded border font-semibold flex items-center gap-1",
              simState.status === "running" && "text-emerald-600 border-emerald-500/20 bg-emerald-500/5",
              simState.status === "paused" && "text-amber-600 border-amber-500/20 bg-amber-500/5",
              simState.status === "idle" && "text-zinc-400 border-border bg-zinc-50",
              simState.status === "error" && "text-rose-600 border-rose-500/20 bg-rose-500/5"
            )}
          >
            {simState.status.toUpperCase()}
          </Badge>
        </div>

        {/* Start / Pause Quick Action */}
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => {
            if (isRunning) {
              setSimStatus("paused");
            } else {
              startSimulation(simState.currentModel || "Office Standard Run");
            }
          }}
          className="h-8 text-xs font-semibold px-3 border-border hover:bg-zinc-50 text-zinc-700"
        >
          {isRunning ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              Pause Sim
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              Start Sim
            </>
          )
          }
        </Button>

        {/* Force Optimize Trigger */}
        <Button 
          size="sm"
          onClick={() => triggerLiveOptimization(runId)}
          disabled={!runId || optimizationLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {optimizationLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Cpu className="h-3.5 w-3.5" />
              Force Optimize
            </>
          )}
        </Button>
      </div>
    </header>

  );
}
