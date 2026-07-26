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
      case "Observation":
        if (simState.status === "running" || simState.status === "finished") {
          return { label: "Complete", variant: "success" };
        }
        return { label: "Active", variant: "active" };

      case "Analysis":
        if (simState.status === "finished") {
          return { label: "Complete", variant: "success" };
        }
        if (simState.status === "running") {
          return { label: "Active", variant: "active" };
        }
        return { label: "Pending", variant: "pending" };

      case "Decision":
        if (simState.status === "finished") {
          if (aiReport) {
            return { label: "Complete", variant: "success" };
          }
          return { label: "Active", variant: "active" };
        }
        return { label: "Pending", variant: "pending" };

      case "Actuation":
        if (simState.status === "finished") {
          return { label: "Complete", variant: "success" };
        }
        if (simState.status === "running") {
          return { label: "Active", variant: "active" };
        }
        return { label: "Ready", variant: "ready" };

      case "Feedback":
        const hasFeedback = decisions.some(d => d.feedbackStatus !== "unrated");
        if (hasFeedback) {
          return { label: "Complete", variant: "success" };
        }
        if (aiReport) {
          return { label: "Waiting", variant: "waiting" };
        }
        return { label: "Pending", variant: "pending" };

      default:
        return { label: "Pending", variant: "pending" };
    }
  };

  const stages = ["Observation", "Analysis", "Decision", "Actuation", "Feedback"];

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden col-span-1">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <RefreshCw className="h-4.5 w-4.5 text-indigo-500 animate-spin" style={{ animationDuration: "8s" }} />
          EcoLoop Autonomous Loop Status
        </CardTitle>
        <CardDescription>Pipeline checkpoints status tracker</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-900/60 text-xs">
          {stages.map((stage) => {
            const status = getStageStatus(stage);
            return (
              <div key={stage} className="py-3 flex items-center justify-between font-medium">
                <span className="text-zinc-600 dark:text-zinc-400 font-semibold">{stage}</span>
                <Badge
                  className={cn(
                    "font-bold px-2 py-0.5 text-[10px] uppercase flex items-center gap-1 border",
                    status.variant === "success" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
                    status.variant === "active" && "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400 animate-pulse",
                    status.variant === "ready" && "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400",
                    status.variant === "waiting" && "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
                    status.variant === "pending" && "bg-zinc-100 text-zinc-400 border-zinc-200/50 dark:bg-zinc-900 dark:border-zinc-800"
                  )}
                >
                  {status.variant === "success" && <Check className="h-3 w-3" />}
                  {status.variant === "waiting" && <Clock className="h-3 w-3" />}
                  {status.variant === "active" && <RefreshCw className="h-3 w-3 animate-spin" />}
                  {status.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
