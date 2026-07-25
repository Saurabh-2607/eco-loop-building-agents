"use client";

import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { Play, Pause, Cpu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-8 select-none flex-shrink-0">
      {/* Title */}
      <div>
        <h1 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">{pageTitle}</h1>
      </div>

      {/* Simulator Controls & Badges */}
      <div className="flex items-center gap-4">
        {/* Simulator Status */}
        <div className="flex items-center gap-2 mr-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Simulator:</span>
          <Badge 
            className={cn(
              "font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border",
              simState.status === "running" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
              simState.status === "paused" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
              simState.status === "idle" && "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
              simState.status === "error" && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            )}
          >
            {simState.status === "running" && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
            {simState.status === "paused" && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            )}
            {simState.status === "idle" && (
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            )}
            {simState.status === "error" && (
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            )}
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
          className="h-8 text-xs font-medium flex items-center gap-1.5"
        >
          {isRunning ? (
            <>
              <Pause className="h-3.5 w-3.5 text-amber-500" />
              Pause Sim
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 text-emerald-500 fill-current" />
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
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-8 flex items-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
