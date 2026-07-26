"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Cpu, ArrowRight, ArrowDown, Activity, Settings, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIAgentThinking() {
  const steps = [
    {
      label: "Input Data",
      value: "EnergyPlus hourly metrics, indoor/outdoor temperatures, occupancy trends.",
      icon: <Activity className="h-4 w-4 text-emerald-500" />,
      color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
    },
    {
      label: "Analysis",
      value: "Detecting cooling schedules, active lighting intensity, and occupancy waste bounds.",
      icon: <Brain className="h-4 w-4 text-amber-500" />,
      color: "border-amber-500/20 bg-amber-500/5 text-amber-500"
    },
    {
      label: "Reasoning",
      value: "Evaluating PMV comfort indices. Lights remain at 80% while zone is completely vacant.",
      icon: <Cpu className="h-4 w-4 text-violet-500" />,
      color: "border-violet-500/20 bg-violet-500/5 text-violet-500"
    },
    {
      label: "Decision",
      value: "Recommend lighting dim to 70% and increment cooling setpoint target to 24.5°C.",
      icon: <Settings className="h-4 w-4 text-sky-500" />,
      color: "border-sky-500/20 bg-sky-500/5 text-sky-500"
    },
    {
      label: "Expected Result",
      value: "Estimated savings target: 12% - 15% reduction in total electrical energy demand load.",
      icon: <TrendingDown className="h-4 w-4 text-pink-500" />,
      color: "border-pink-500/20 bg-pink-500/5 text-pink-500"
    }
  ];

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden select-none">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60 bg-zinc-50/50 dark:bg-zinc-900/10">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Brain className="h-4.5 w-4.5 text-violet-500 animate-pulse" />
          AI Agent Reasoning Workflow
        </CardTitle>
        <CardDescription>Visualized LangGraph workflow parsing building conditions</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-stretch justify-between gap-4 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="flex-1 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
              <div className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 rounded-xl shadow-sm flex flex-col items-center text-center space-y-3 relative hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors w-full">
                <div className={cn("h-8 w-8 rounded-lg border flex items-center justify-center shadow-sm", step.color)}>
                  {step.icon}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Step {idx + 1}</span>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{step.label}</h4>
                  <p className="text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500 font-medium max-w-[160px] mx-auto">
                    {step.value}
                  </p>
                </div>
              </div>
              
              {/* Arrow separator */}
              {idx < steps.length - 1 && (
                <div className="flex items-center justify-center text-zinc-300 dark:text-zinc-700 flex-shrink-0">
                  <ArrowRight className="hidden md:block h-5 w-5" />
                  <ArrowDown className="block md:hidden h-5 w-5 my-1" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
