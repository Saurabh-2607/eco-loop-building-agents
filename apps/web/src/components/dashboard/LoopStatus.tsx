"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoopStatus() {
  const { simState, aiReport, decisions } = useAppStore();

  const getStageStatus = (stage: string) => {
    switch (stage) {
      case "OBSERVE":
        if (simState.status === "running" || simState.status === "finished") {
          return { label: "Energy data collected", variant: "success" };
        }
        return { label: "Waiting for telemetry", variant: "pending" };

      case "ANALYZE":
        if (simState.status === "finished") {
          return { label: "AI evaluated building performance", variant: "success" };
        }
        if (simState.status === "running") {
          return { label: "Evaluating comfort index", variant: "active" };
        }
        return { label: "Awaiting run records", variant: "pending" };

      case "DECIDE":
        if (simState.status === "finished") {
          if (aiReport) {
            return { label: "Optimization strategy generated", variant: "success" };
          }
          return { label: "Calculating schedule bounds", variant: "active" };
        }
        return { label: "Awaiting AI models boot", variant: "pending" };

      case "ACT":
        if (simState.status === "finished") {
          return { label: "Control parameters updated", variant: "success" };
        }
        if (simState.status === "running") {
          return { label: "Overriding actuators", variant: "active" };
        }
        return { label: "Ready to schedule", variant: "ready" };

      case "LEARN":
        const hasFeedback = decisions.some(d => d.feedbackStatus !== "unrated");
        if (hasFeedback) {
          return { label: "Model policies calibrated", variant: "success" };
        }
        return { label: "Waiting for next simulation", variant: "waiting" };

      default:
        return { label: "Awaiting boot sequence", variant: "pending" };
    }
  };

  const stages = ["OBSERVE", "ANALYZE", "DECIDE", "ACT", "LEARN"];

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden col-span-1">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <RefreshCw className="h-4.5 w-4.5 text-indigo-500 animate-spin" style={{ animationDuration: "8s" }} />
          EcoLoop Autonomous Loop
        </CardTitle>
        <CardDescription>Continuous feedback control loop parameters</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4 text-xs font-semibold">
          {stages.map((stage) => {
            const status = getStageStatus(stage);
            const isComplete = status.variant === "success";
            const isActive = status.variant === "active";
            const isWaiting = status.variant === "waiting";
            const isReady = status.variant === "ready";

            return (
              <div key={stage} className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-900/40 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-900 dark:text-zinc-50 font-bold uppercase tracking-wider text-[10px]">{stage}</span>
                  <Badge
                    className={cn(
                      "font-extrabold px-1.5 py-0 rounded text-[9px] uppercase flex items-center gap-1 border",
                      isComplete && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
                      isActive && "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400 animate-pulse",
                      isReady && "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400",
                      isWaiting && "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
                      status.variant === "pending" && "bg-zinc-100 text-zinc-400 border-zinc-200/50 dark:bg-zinc-900 dark:border-zinc-800"
                    )}
                  >
                    {isComplete && <Check className="h-2.5 w-2.5" />}
                    {isWaiting && <Clock className="h-2.5 w-2.5" />}
                    {isActive && <RefreshCw className="h-2.5 w-2.5 animate-spin" />}
                    {isComplete ? "COMPLETED" : isActive ? "PROCESSING" : isReady ? "READY" : isWaiting ? "WAITING" : "PENDING"}
                  </Badge>
                </div>
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
