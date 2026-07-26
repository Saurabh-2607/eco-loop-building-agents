"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SimulationProgress() {
  const { simState, aiReport } = useAppStore();

  const getStepState = (idx: number) => {
    const status = simState.status;

    // Step 0: Building Loaded
    if (idx === 0) return "success";

    // Step 1: EnergyPlus Running
    if (idx === 1) {
      if (status === "running") return "active";
      if (status === "finished" || status === "paused") return "success";
      return "pending";
    }

    // Step 2: Data Generated
    if (idx === 2) {
      if (status === "running") return "pending";
      if (status === "finished") return "success";
      return "pending";
    }

    // Step 3: AI Analyzing
    if (idx === 3) {
      if (status === "finished") {
        if (aiReport) return "success";
        return "active";
      }
      return "pending";
    }

    // Step 4: Optimization Ready
    if (idx === 4) {
      if (status === "finished" && aiReport) return "success";
      return "pending";
    }

    return "pending";
  };

  const steps = [
    "Building Loaded",
    "EnergyPlus Running",
    "Data Generated",
    "AI Analyzing",
    "Optimization Ready"
  ];

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm select-none">
      <CardContent className="p-0 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900/60 flex-wrap gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-violet-500 fill-current" />
            Building Optimization Pipeline
          </h4>
          <span className="text-[10px] font-mono text-zinc-400 font-semibold">
            STATUS: {simState.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-1">
          {steps.map((step, idx) => {
            const state = getStepState(idx);
            return (
              <div key={idx} className="flex items-center gap-2">
                <div 
                  className={cn(
                    "h-6 w-6 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-all duration-300",
                    state === "success" && "bg-emerald-500/10 border-emerald-500 text-emerald-500",
                    state === "active" && "bg-violet-500/10 border-violet-500 text-violet-600 animate-pulse",
                    state === "pending" && "bg-zinc-50 border-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800"
                  )}
                >
                  {state === "success" ? (
                    <Check className="h-3 w-3 stroke-[3px]" />
                  ) : state === "active" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span 
                  className={cn(
                    "text-[10px] font-semibold tracking-tight transition-colors duration-300",
                    state === "success" && "text-zinc-900 dark:text-zinc-100 font-bold",
                    state === "active" && "text-violet-600 dark:text-violet-400 font-bold",
                    state === "pending" && "text-zinc-400 dark:text-zinc-500"
                  )}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
