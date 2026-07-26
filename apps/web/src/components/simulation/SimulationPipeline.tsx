"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SimulationPipeline() {
  const { detailedStatus } = useAppStore();

  const getStepState = (idx: number) => {
    // Map of detailedStatus order
    const statusOrder = [
      "idle",
      "initializing",
      "loading_model",
      "running_energyplus",
      "collecting_telemetry",
      "analyzing_data",
      "generating_ai_report",
      "applying_optimization",
      "completed"
    ];

    if (detailedStatus === "failed") {
      return idx <= 1 ? "success" : "failed";
    }

    const currentIdx = statusOrder.indexOf(detailedStatus);

    // Step 0: Building Model Loaded
    if (idx === 0) {
      if (currentIdx >= 3) return "success";
      if (currentIdx === 2) return "active";
      return "pending";
    }

    // Step 1: EnergyPlus Simulation Running
    if (idx === 1) {
      if (currentIdx >= 4) return "success";
      if (currentIdx === 3) return "active";
      return "pending";
    }

    // Step 2: Collecting Real-Time Telemetry
    if (idx === 2) {
      if (currentIdx >= 5) return "success";
      if (currentIdx === 4) return "active";
      return "pending";
    }

    // Step 3: AI Agent Analyzing Performance
    if (idx === 3) {
      if (currentIdx >= 6) return "success";
      if (currentIdx === 5) return "active";
      return "pending";
    }

    // Step 4: Generating Optimization Decision
    if (idx === 4) {
      if (currentIdx >= 7) return "success";
      if (currentIdx === 6) return "active";
      return "pending";
    }

    // Step 5: Applying Control Strategy
    if (idx === 5) {
      if (currentIdx >= 8) return "success";
      if (currentIdx === 7) return "active";
      return "pending";
    }

    // Step 6: Measuring Energy Savings
    if (idx === 6) {
      if (currentIdx === 8) return "success";
      return "pending";
    }

    return "pending";
  };

  const steps = [
    { title: "Building Model Loaded", desc: "Reading Chicago Office Standard IDF configuration" },
    { title: "EnergyPlus Simulation Running", desc: "Executing building thermal load simulations" },
    { title: "Collecting Real-Time Telemetry", desc: "Logging HVAC, light, temp and occupant sensors" },
    { title: "AI Agent Analyzing Performance", desc: "LangGraph reasoning maps isolating utility load leaks" },
    { title: "Generating Optimization Decision", desc: "Formulating setpoint schedule recommendations" },
    { title: "Applying Control Strategy", desc: "Updating lighting dim and HVAC actuator overrides" },
    { title: "Measuring Energy Savings", desc: "Confirming utility metrics before vs after comparison" }
  ];

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm select-none">
      <CardContent className="p-0 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-150 dark:border-zinc-900/60 flex-wrap gap-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-violet-500 fill-current" />
            EcoLoop Autonomous Optimization Pipeline
          </h4>
          <Badge variant="outline" className="font-mono text-zinc-400 border-zinc-200 dark:border-zinc-800 text-[10px] px-2 py-0.5">
            STEP: {detailedStatus.replace("_", " ").toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-4">
          {steps.map((step, idx) => {
            const state = getStepState(idx);
            return (
              <div key={idx} className="flex items-start gap-4">
                <div 
                  className={cn(
                    "h-6 w-6 rounded-full border flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-300 mt-0.5",
                    state === "success" && "bg-emerald-500/10 border-emerald-500 text-emerald-500",
                    state === "active" && "bg-violet-500/10 border-violet-500 text-violet-600 animate-pulse scale-105",
                    state === "failed" && "bg-rose-500/10 border-rose-500 text-rose-500",
                    state === "pending" && "bg-zinc-50 border-zinc-250 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-805/60"
                  )}
                >
                  {state === "success" ? (
                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                  ) : state === "active" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : state === "failed" ? (
                    <AlertCircle className="h-3.5 w-3.5" />
                  ) : (
                    idx + 1
                  )}
                </div>
                
                <div className="space-y-0.5 flex-1">
                  <span 
                    className={cn(
                      "text-xs font-bold transition-colors duration-300 block",
                      state === "success" && "text-zinc-900 dark:text-zinc-100",
                      state === "active" && "text-violet-600 dark:text-violet-400 font-extrabold",
                      state === "failed" && "text-rose-500",
                      state === "pending" && "text-zinc-450 dark:text-zinc-500"
                    )}
                  >
                    {step.title}
                  </span>
                  <p className="text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-505/80">
                    {state === "active" ? "Processing active queue..." : state === "pending" ? "Waiting..." : step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
