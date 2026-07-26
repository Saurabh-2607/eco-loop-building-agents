"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Sparkles, Cpu, Sliders, PlayCircle, Eye, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: "LOAD", name: "Building Loaded", icon: Eye },
  { id: "RUN", name: "EnergyPlus Running", icon: PlayCircle },
  { id: "GEN", name: "Data Generated", icon: Sliders },
  { id: "AI", name: "AI Analyzing", icon: Cpu },
  { id: "READY", name: "Optimization Ready", icon: CheckCircle2 },
];

export default function SimulationProgress() {
  const { simState, aiReport } = useAppStore();
  const status = simState.status;

  const activeIndex = (() => {
    if (status === "running")  return 1;
    if (status === "paused")   return 1;
    if (status === "error")    return 0;
    if (status === "finished") return aiReport ? 4 : 3;
    return 0; // idle
  })();

  const getStepState = (idx: number) => {
    if (idx < activeIndex) return "success";
    if (idx === activeIndex) {
      if (status === "running") return "active";
      if (status === "finished") return "active";
      return "pending";
    }
    return "pending";
  };

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60 flex flex-row items-center justify-between gap-4 flex-wrap flex-shrink-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-neutral-500" />
            Building Optimization Pipeline
          </CardTitle>
          <CardDescription>Real-time execution status of the pipeline simulator run</CardDescription>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          color: "#525252",
          padding: "4px 10px", borderRadius: 6,
          border: "1px solid #e5e5e5", background: "#f5f5f5",
        }}>
          STATUS: {simState.status.toUpperCase()}
        </span>
      </CardHeader>

      <CardContent className="p-4">
        {/* Horizontal grid container for steps timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {STAGES.map((stage, idx) => {
            const stepState = getStepState(idx);
            const isCompleted = stepState === "success";
            const isActive = stepState === "active";
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-3.5 flex flex-col items-center justify-between gap-3 text-center min-w-0"
                style={{ minHeight: 125 }}
              >
                {/* Circular step checkmark */}
                <div
                  className={cn("flex items-center justify-center flex-shrink-0 rounded-3xl", isActive && "animate-pulse")}
                  style={{
                    width: 32,
                    height: 32,
                    border: `1.5px solid ${isCompleted || isActive ? "#171717" : "#e5e5e5"}`,
                    background: isCompleted ? "#171717" : isActive ? "#f5f5f5" : "#fafafa",
                    color: isCompleted ? "#ffffff" : isActive ? "#171717" : "#a3a3a3",
                  }}
                >
                  {isCompleted ? (
                    <Check style={{ width: 14, height: 14, strokeWidth: 3 }} />
                  ) : (
                    <Icon style={{ width: 14, height: 14 }} />
                  )}
                </div>

                {/* Stage Name */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 750,
                    color: isCompleted ? "#525252" : "#171717",
                    lineHeight: 1.2,
                  }}
                  className="px-1"
                >
                  {stage.name}
                </span>

                {/* State Badge */}
                <Badge
                  className="font-extrabold px-2 py-0.5 rounded text-[8px] uppercase tracking-wider flex items-center gap-0.5 border"
                  style={{
                    backgroundColor: isCompleted ? "#fafafa" : isActive ? "#f5f5f5" : "#ffffff",
                    borderColor: isCompleted || isActive ? "#e5e5e5" : "#f0f0f0",
                    color: isCompleted ? "#737373" : isActive ? "#171717" : "#a3a3a3",
                  }}
                >
                  {isCompleted && <Check style={{ width: 9, height: 9, strokeWidth: 3 }} />}
                  {isActive && <Loader2 className="h-2 w-2 animate-spin" />}
                  {isCompleted ? "COMPLETED" : isActive ? "PROCESSING" : "PENDING"}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
