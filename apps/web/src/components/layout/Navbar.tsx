"use client";

import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
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

  const runId = simState.runId;

  // Determine button state dynamic properties based on the simulation state
  const buttonConfig = (() => {
    switch (simState.status) {
      case "running":
        return {
          text: "Pause Simulation",
          icon: <Pause className="h-4 w-4" aria-hidden />,
          style: { backgroundColor: "#ffffff", borderColor: "#e5e5e5", color: "#171717", border: "1px solid #e5e5e5" },
          onClick: () => setSimStatus("paused"),
        };
      case "paused":
        return {
          text: "Resume Simulation",
          icon: <Play className="h-4 w-4 fill-current" aria-hidden />,
          style: { backgroundColor: "#171717", color: "#ffffff" },
          onClick: () => setSimStatus("running"),
        };
      case "finished":
        return {
          text: "Restart Simulation",
          icon: <Play className="h-4 w-4 fill-current" aria-hidden />,
          style: { backgroundColor: "#171717", color: "#ffffff" },
          onClick: () => startSimulation(simState.currentModel || "Chicago Office Standard Simulation"),
        };
      default: // idle or error
        return {
          text: "Start Simulation",
          icon: <Play className="h-4 w-4 fill-current" aria-hidden />,
          style: { backgroundColor: "#171717", color: "#ffffff" },
          onClick: () => startSimulation(simState.currentModel || "Chicago Office Standard Simulation"),
        };
    }
  })();

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
            Simulator
          </span>
          <Badge
            className="font-extrabold uppercase text-[9px] px-2.5 py-1 border tracking-wider h-6 flex items-center"
            style={{ borderColor: "#e5e5e5", backgroundColor: "#fafafa", color: "#737373" }}
          >
            {simState.status.toUpperCase()}
          </Badge>
        </div>

        {/* Dynamic Pause / Start / Resume / Restart Button */}
        <Button
          onClick={buttonConfig.onClick}
          className="h-9 text-xs font-semibold px-4 flex items-center gap-2 transition-colors"
          style={buttonConfig.style}
        >
          {buttonConfig.icon}
          {buttonConfig.text}
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
