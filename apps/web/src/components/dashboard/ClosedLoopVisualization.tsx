"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, PlayCircle, Cpu, Eye, Check, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClosedLoopVisualization() {
  const { simState, aiReport, wsConnected } = useAppStore();

  // Determine active stage based on live store parameters
  const currentStageIndex = (() => {
    if (simState.status === "running") return 3; // Actuation phase
    if (simState.status === "paused") return 1;
    if (simState.status === "error") return 0;
    
    // Finished state
    if (simState.status === "finished") {
      if (aiReport) {
        return 4; // Feedback phase (report ready for review)
      }
      return 2; // Decision/Optimization engine running
    }
    
    return 0; // Observation phase (idle)
  })();

  const stages = [
    {
      name: "Observation",
      description: "Sensor data collection (temp, humidity, power)",
      icon: <Eye className="h-4 w-4" />
    },
    {
      name: "Analysis",
      description: "Extracting building envelope parameters",
      icon: <Sliders className="h-4 w-4" />
    },
    {
      name: "Decision",
      description: "LangGraph reasoning & recommendations",
      icon: <Cpu className="h-4 w-4" />
    },
    {
      name: "Actuation",
      description: "Submitting overrides to EnergyPlus simulator",
      icon: <PlayCircle className="h-4 w-4" />
    },
    {
      name: "Feedback",
      description: "Evaluating operator feedback and compliance",
      icon: <CheckCircle2 className="h-4 w-4" />
    }
  ];

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden col-span-1 lg:col-span-3">
      <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-900/60 flex flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 fill-current" />
            Autonomous Closed-Loop Pipeline
          </CardTitle>
          <CardDescription>Real-time execution path of the building optimization network</CardDescription>
        </div>
        <Badge variant={wsConnected ? "default" : "secondary"} className={cn("text-[10px] font-bold px-2 py-0.5", wsConnected ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-zinc-100 text-zinc-600")}>
          {wsConnected ? "CLOSED LOOP SYNCED" : "OFFLINE"}
        </Badge>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isActive = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;

            return (
              <div key={idx} className="relative flex flex-col items-center text-center space-y-3">
                {/* Horizontal Connector Line for Larger Screens */}
                {idx < stages.length - 1 && (
                  <div 
                    className={cn(
                      "hidden md:block absolute top-6 left-[60%] right-[-40%] h-0.5 z-0 transition-colors duration-500",
                      isCompleted ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"
                    )}
                  />
                )}

                {/* Ring Indicator */}
                <div 
                  className={cn(
                    "h-12 w-12 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 shadow-sm",
                    isCompleted && "bg-emerald-50 border-emerald-500 text-emerald-500 dark:bg-emerald-950/20",
                    isActive && "bg-violet-50 border-violet-500 text-violet-600 animate-pulse dark:bg-violet-950/30 scale-105 shadow-violet-500/10",
                    isPending && "bg-zinc-50 border-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 stroke-[3px]" />
                  ) : (
                    stage.icon
                  )}
                </div>

                {/* Labels */}
                <div className="space-y-1 z-10">
                  <h4 
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider transition-colors duration-300",
                      isCompleted && "text-emerald-600 dark:text-emerald-400",
                      isActive && "text-violet-600 dark:text-violet-400",
                      isPending && "text-zinc-400 dark:text-zinc-500"
                    )}
                  >
                    {stage.name}
                  </h4>
                  <p className="text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500 max-w-[140px] mx-auto font-medium">
                    {stage.description}
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
