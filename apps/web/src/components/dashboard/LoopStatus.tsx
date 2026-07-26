"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, RefreshCw } from "lucide-react";
import InfoTooltip from "@/components/dashboard/InfoTooltip";

export default function LoopStatus() {
  const { simState, detailedStatus, decisions } = useAppStore();

  const getStageStatus = (stage: string) => {
    switch (stage) {
      case "OBSERVE":
        if (detailedStatus === "initializing" || detailedStatus === "loading_model") {
          return { label: "Awaiting sequence boot", variant: "pending" };
        }
        return { label: "Energy data collected", variant: "success" };

      case "ANALYZE":
        if (simState.status === "finished") {
          return { label: "AI evaluated building performance", variant: "success" };
        }
        if (detailedStatus === "running_energyplus") {
          return { label: "Evaluating comfort index", variant: "active" };
        }
        if (detailedStatus === "analyzing_data" || detailedStatus === "applying_optimization") {
          return { label: "Telemetry parameters evaluated", variant: "success" };
        }
        return { label: "Awaiting run records", variant: "pending" };

      case "DECIDE":
        if (simState.status === "finished" || detailedStatus === "applying_optimization") {
          return { label: "Optimization strategy generated", variant: "success" };
        }
        if (detailedStatus === "analyzing_data") {
          return { label: "Calculating schedule bounds", variant: "active" };
        }
        return { label: "Awaiting AI models boot", variant: "pending" };

      case "ACT":
        if (simState.status === "finished") {
          return { label: "Control parameters updated", variant: "success" };
        }
        if (detailedStatus === "applying_optimization") {
          return { label: "Overriding actuators", variant: "active" };
        }
        return { label: "Ready to schedule", variant: "ready" };

      case "LEARN":
        const hasFeedback = decisions.some(d => d.feedbackStatus !== "unrated");
        if (hasFeedback) {
          return { label: "Model policies calibrated", variant: "success" };
        }
        return { label: "Waiting for operator ratings", variant: "waiting" };

      default:
        return { label: "Awaiting sequence boot", variant: "pending" };
    }
  };

  const stages = ["OBSERVE", "ANALYZE", "DECIDE", "ACT", "LEARN"];

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60 flex-shrink-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <RefreshCw className="h-4.5 w-4.5 text-indigo-500 animate-spin" style={{ animationDuration: "8s" }} />
          EcoLoop Autonomous Loop
          <InfoTooltip content="Traces control feedback status details. Observes active loads, analyzes thermal inertia, decides comfort setpoints, actuates overrides, and learns from user feedback." />
        </CardTitle>
        <CardDescription>Continuous feedback control loop parameters</CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5 flex-1 flex flex-col justify-between">
          {stages.map((stage) => {
            const status = getStageStatus(stage);
            const isComplete = status.variant === "success";
            const isActive = status.variant === "active";
            const isWaiting = status.variant === "waiting";
            const isReady = status.variant === "ready";

            return (
              <div
                key={stage}
                className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-3.5 flex flex-col gap-1.5 flex-1 justify-center"
              >
                <div className="flex items-center justify-between">
                  {/* Top: Gray uppercase small tracking label */}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#a3a3a3",
                      lineHeight: 1.1,
                    }}
                  >
                    {stage}
                  </span>
                  <Badge
                    className="font-extrabold px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider flex items-center gap-1 border flex-shrink-0"
                    style={{
                      backgroundColor: isComplete ? "#fafafa" : isActive ? "#f5f5f5" : "#ffffff",
                      borderColor: isComplete || isActive ? "#e5e5e5" : "#f0f0f0",
                      color: isComplete ? "#737373" : isActive ? "#171717" : "#a3a3a3",
                    }}
                  >
                    {isComplete && <Check className="h-2.5 w-2.5" />}
                    {isWaiting && <Clock className="h-2.5 w-2.5" />}
                    {isActive && <RefreshCw className="h-2.5 w-2.5 animate-spin" />}
                    {isComplete ? "COMPLETED" : isActive ? "PROCESSING" : isReady ? "READY" : isWaiting ? "WAITING" : "PENDING"}
                  </Badge>
                </div>
                {/* Bottom: Dark bold non-truncated status text */}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#171717",
                    lineHeight: 1.25,
                  }}
                >
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
