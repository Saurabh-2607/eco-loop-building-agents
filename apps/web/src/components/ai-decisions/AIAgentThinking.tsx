"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, ArrowRight, ArrowDown, Activity, Settings, TrendingDown, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIAgentThinking() {
  const steps = [
    {
      label: "Input Data",
      value: "EnergyPlus Results",
      desc: "Reading dynamic hourly building telemetry parameters.",
      icon: <Activity className="h-4 w-4 text-emerald-500" />,
      color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
    },
    {
      label: "Analysis",
      value: "HVAC consumes 85% energy",
      desc: "Isolating mechanical load spikes during high building load peaks.",
      icon: <Brain className="h-4 w-4 text-amber-500" />,
      color: "border-amber-500/20 bg-amber-500/5 text-amber-500"
    },
    {
      label: "Decision",
      value: "Optimize HVAC schedule",
      desc: "Modifying cooling setpoint maps and reducing night fan speed profiles.",
      icon: <Settings className="h-4 w-4 text-violet-500" />,
      color: "border-violet-500/20 bg-violet-500/5 text-violet-500"
    },
    {
      label: "Expected Impact",
      value: "12% energy reduction",
      desc: "Projecting total utility demand load reductions inside simulated runs.",
      icon: <TrendingDown className="h-4 w-4 text-sky-500" />,
      color: "border-sky-500/20 bg-sky-500/5 text-sky-500"
    },
    {
      label: "Result",
      value: "Measured savings",
      desc: "Checking verified timeseries database columns to validate savings.",
      icon: <ClipboardList className="h-4 w-4 text-pink-500" />,
      color: "border-pink-500/20 bg-pink-500/5 text-pink-500"
    }
  ];

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden select-none">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60 bg-zinc-50/50 dark:bg-zinc-900/10">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Brain className="h-4.5 w-4.5 text-violet-500 animate-pulse" />
          AI Reasoning Timeline
        </CardTitle>
        <CardDescription>Visualized LangGraph agent optimization process flow</CardDescription>
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
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{step.label}</h4>
                  <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                    {step.value}
                  </p>
                  <p className="text-[9px] leading-relaxed text-zinc-450 dark:text-zinc-500 mt-1 max-w-[140px] mx-auto font-medium">
                    {step.desc}
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
