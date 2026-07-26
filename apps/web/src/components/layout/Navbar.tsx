"use client";

import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
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
    setSimStatus,
  } = useAppStore();

  const pageTitle = (() => {
    switch (pathname) {
      case "/":           return "Dashboard Overview";
      case "/analytics":  return "Performance Analytics";
      case "/simulation": return "EnergyPlus Runtime Control";
      case "/ai-decisions": return "AI Decisions Timeline";
      case "/settings":   return "System Settings";
      default:            return "EcoLoop Building Agents";
    }
  })();

  const isRunning = simState.status === "running";
  const runId = simState.runId;

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-6 select-none border-b border-border bg-background"
      style={{ height: 64 }}
    >
      {/* Left: sidebar toggle + page title */}
      <div className="flex items-center gap-3">
        <SidebarTrigger
          className="h-9 w-9 transition-colors flex items-center justify-center rounded-xl border border-zinc-200"
          style={{ color: "#737373" }}
          aria-label="Toggle navigation"
        />
        <h1
          className="text-base font-semibold tracking-tight"
          style={{ letterSpacing: "-0.015em", color: "#171717" }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Right: simulator controls */}
      <div className="flex items-center gap-4">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-extrabold font-mono uppercase tracking-widest"
            style={{ color: "#a3a3a3" }}
          >
            Simulator
          </span>
          <Badge
            className="font-extrabold uppercase text-[9px] px-2.5 py-1 border tracking-wider h-6 flex items-center"
            style={{ borderColor: "#e5e5e5", backgroundColor: "#fafafa", color: "#737373" }}
          >
            {simState.status.toUpperCase()}
          </Badge>
        </div>

        {/* Pause / Start */}
        <Button
          onClick={() => {
            if (isRunning) {
              setSimStatus("paused");
            } else {
              startSimulation(simState.currentModel || "Chicago Office Standard Simulation");
            }
          }}
          className="h-9 text-xs font-semibold px-4 flex items-center gap-2"
          style={{ backgroundColor: "#ffffff", borderColor: "#e5e5e5", color: "#171717", border: "1px solid #e5e5e5" }}
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4" aria-hidden />
              Pause Simulation
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" aria-hidden />
              Start Simulation
            </>
          )}
        </Button>

        {/* Force Optimize */}
        <Button
          onClick={() => triggerLiveOptimization(runId)}
          disabled={!runId || optimizationLoading}
          className="h-9 text-xs font-semibold px-4 flex items-center gap-2"
          style={{ backgroundColor: "#171717", color: "#ffffff" }}
        >
          {optimizationLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Optimising…
            </>
          ) : (
            <>
              <Cpu className="h-4 w-4" aria-hidden />
              Optimise Now
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
