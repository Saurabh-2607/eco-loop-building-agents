"use client";

import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Play, Cpu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const pathname = usePathname();
  const {
    simState,
    aiReportLoading,
    startSimulation,
    triggerManualOptimization,
  } = useAppStore();

  const pageTitle = (() => {
    switch (pathname) {
      case "/":           return "Dashboard Overview";
      case "/settings":   return "System Settings";
      default:            return "EcoLoop Building Agents";
    }
  })();

  const isRunning = simState.status === "running";

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-6 select-none border-b border-border bg-background"
      style={{ height: 64 }}
    >
      {/* Left: page title */}
      <div className="flex items-center gap-3">
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
            Twin State
          </span>
          <Badge
            className="font-extrabold uppercase text-[9px] px-2.5 py-1 border tracking-wider h-6 flex items-center"
            style={{ 
              borderColor: isRunning ? "#e5e5e5" : "#f0f0f0", 
              backgroundColor: isRunning ? "#fafafa" : "#ffffff", 
              color: isRunning ? "#16a34a" : "#737373" 
            }}
          >
            {isRunning ? "🟢 RUNNING" : "⚪ IDLE"}
          </Badge>
        </div>

        {/* Primary Action Button: Start Simulation or Run Optimization Now */}
        {!isRunning ? (
          <Button
            onClick={() => startSimulation("Chicago Office Standard Simulation")}
            className="h-9 text-xs font-semibold px-4 flex items-center gap-2 transition-colors"
            style={{ backgroundColor: "#171717", color: "#ffffff" }}
          >
            <Play className="h-4 w-4 fill-current" aria-hidden />
            Start Live Simulation
          </Button>
        ) : (
          <Button
            onClick={triggerManualOptimization}
            disabled={aiReportLoading}
            className="h-9 text-xs font-semibold px-4 flex items-center gap-2 transition-colors"
            style={{ backgroundColor: "#171717", color: "#ffffff" }}
          >
            {aiReportLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Optimizing...
              </>
            ) : (
              <>
                <Cpu className="h-4 w-4" aria-hidden />
                Run Optimization Now
              </>
            )}
          </Button>
        )}
      </div>
    </header>
  );
}
