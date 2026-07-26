"use client";

import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Cpu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();
  const {
    metrics,
    aiReportLoading,
    triggerManualOptimization,
  } = useAppStore();

  const pageTitle = (() => {
    switch (pathname) {
      case "/":           return "Dashboard Overview";
      case "/settings":   return "System Settings";
      default:            return "EcoLoop Building Agents";
    }
  })();

  const lastMetric = metrics[metrics.length - 1];
  const lastUpdate = lastMetric ? lastMetric.timestamp : "22:00";

  const calculateNextOptimization = (timestamp: string) => {
    const parts = timestamp.split(":");
    if (parts.length < 2) return "23:00";
    const hour = parseInt(parts[0], 10);
    const nextHour = (hour + 1) % 24;
    return `${String(nextHour).padStart(2, "0")}:00`;
  };
  const nextOptimization = calculateNextOptimization(lastUpdate);

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

      {/* Right: simulator status and manual triggers */}
      <div className="flex items-center gap-6">
        {/* Real-time status display panel */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex flex-col items-end">
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#a3a3a3", letterSpacing: "0.06em" }}>
              Simulator
            </span>
            <span className="flex items-center gap-1.5 font-bold text-green-600 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
              ● RUNNING
            </span>
          </div>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>

          <div className="flex flex-col items-start">
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#a3a3a3", letterSpacing: "0.06em" }}>
              Last Update
            </span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 font-mono">
              {lastUpdate}
            </span>
          </div>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>

          <div className="flex flex-col items-start">
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#a3a3a3", letterSpacing: "0.06em" }}>
              Next Optimization
            </span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 font-mono">
              {nextOptimization}
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>

        {/* Action Button: Run Optimization Now */}
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
      </div>
    </header>
  );
}
