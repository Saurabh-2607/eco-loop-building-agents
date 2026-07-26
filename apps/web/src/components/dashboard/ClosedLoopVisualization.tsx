"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Cpu, Eye, Check, Sliders, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import InfoTooltip from "@/components/dashboard/InfoTooltip";

const STAGES = [
  { id: "OBSERVE", name: "Observation", desc: "Sensor data collection (temp, humidity, power)", icon: Eye },
  { id: "ANALYZE", name: "Analysis", desc: "Extracting building envelope parameters", icon: Sliders },
  { id: "DECIDE", name: "Decision", desc: "Ollama Qwen3:8B reasoning & recommendations", icon: Cpu },
  { id: "ACTUATE", name: "Actuation", desc: "Submitting overrides to EnergyPlus simulator", icon: PlayCircle },
];

export default function ClosedLoopVisualization() {
  const { simState, detailedStatus, wsConnected, metrics } = useAppStore();

  const activeIndex = (() => {
    if (detailedStatus === "initializing" || detailedStatus === "loading_model") return 0;
    if (detailedStatus === "collecting_telemetry") return 1;
    if (detailedStatus === "analyzing_data") return 2;
    if (detailedStatus === "applying_optimization") return 3;
    // When running normally (waiting for next tick) or completed, show all steps as completed (activeIndex = 4)
    if (detailedStatus === "running_energyplus" || detailedStatus === "completed" || simState.status === "finished") return 4;
    return 4; // Default to fully completed state between cycles
  })();

  const lastMetric = metrics[metrics.length - 1];
  const lastUpdate = lastMetric ? lastMetric.timestamp : "22:00";
  
  const calculateNextOptimization = (timestamp: string) => {
    let timePart = timestamp;
    let datePart = "";
    if (timestamp.includes(", ")) {
      const splitParts = timestamp.split(", ");
      datePart = splitParts[0] + ", ";
      timePart = splitParts[1];
    }
    const parts = timePart.split(":");
    if (parts.length < 2) return "23:00";
    const hour = parseInt(parts[0], 10);
    if (isNaN(hour)) return "23:00";
    const nextHour = (hour + 1) % 24;
    return `${datePart}${String(nextHour).padStart(2, "0")}:00`;
  };
  const nextOptimization = calculateNextOptimization(lastUpdate);

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60 flex flex-row items-center justify-between gap-4 flex-wrap flex-shrink-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <RefreshCw className="h-4.5 w-4.5 text-neutral-500 animate-spin" style={{ animationDuration: "8s" }} />
            EcoLoop Real-Time Optimization
            <InfoTooltip content="Shows the live status of the automation cycle: digital twin execution, hourly database polling, AI LangGraph auditing, actuating overrides, and verifying saving margins." />
          </CardTitle>
          <CardDescription>Real-time execution path of the building optimization network</CardDescription>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          color: wsConnected ? "#171717" : "#a3a3a3",
          padding: "4px 10px", borderRadius: 6,
          border: "1px solid #e5e5e5", background: "#f5f5f5",
        }}>
          {wsConnected ? "CLOSED LOOP SYNCED" : "OFFLINE"}
        </span>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        {/* Stages list container with fixed space-y-3.5 instead of flexing children sizes to prevent squishing */}
        <div className="space-y-3.5">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive    = idx === activeIndex;
            const Icon        = stage.icon;

            return (
              <div
                key={stage.id}
                className="bg-neutral-50/50 border border-neutral-100 dark:bg-zinc-900/10 dark:border-zinc-900 rounded-2xl p-3.5 flex items-center justify-between gap-4"
              >
                {/* Left side: Icon + Name and description */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className={cn("flex items-center justify-center flex-shrink-0 rounded-2xl", isActive && "animate-pulse")}
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

                  <div className="flex flex-col min-w-0 flex-1">
                    {/* Top: Gray tracking uppercase label */}
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
                      {stage.name}
                    </span>
                    {/* Bottom: Dark bold non-truncated value */}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isCompleted ? "#525252" : "#171717",
                        marginTop: 3,
                        lineHeight: 1.25,
                      }}
                    >
                      {stage.desc}
                    </span>
                  </div>
                </div>

                {/* Right side: status badge */}
                <Badge
                  className="font-extrabold px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider flex items-center gap-1 border flex-shrink-0"
                  style={{
                    backgroundColor: isCompleted ? "#fafafa" : isActive ? "#f5f5f5" : "#ffffff",
                    borderColor: isCompleted || isActive ? "#e5e5e5" : "#f0f0f0",
                    color: isCompleted ? "#737373" : isActive ? "#171717" : "#a3a3a3",
                  }}
                >
                  {isCompleted && <Check style={{ width: 11, height: 11, strokeWidth: 3 }} />}
                  {isActive && <RefreshCw className="h-2.5 w-2.5 animate-spin" />}
                  {isCompleted ? "COMPLETED" : isActive ? "PROCESSING" : "PENDING"}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Next Cycle footer info */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900/60 flex items-center justify-between text-xs text-zinc-500 font-medium">
          <span className="flex items-center gap-1.5 font-mono">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            Next Cycle: {nextOptimization}
          </span>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            Continuous Loop Active
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
