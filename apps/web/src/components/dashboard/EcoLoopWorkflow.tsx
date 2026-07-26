"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Activity, Cpu, Settings, ChevronRight, TrendingDown, ClipboardList } from "lucide-react";

export default function EcoLoopWorkflow() {
  const steps = [
    {
      num: "01",
      title: "Run Simulation",
      description: "Load building model configuration and run EnergyPlus thermal emulator.",
      icon: <Play className="h-5 w-5 text-emerald-500 fill-current" />
    },
    {
      num: "02",
      title: "Collect Data",
      description: "Log live timeseries inputs for HVAC loads, lights, temperatures, and occupancies.",
      icon: <Activity className="h-5 w-5 text-amber-500" />
    },
    {
      num: "03",
      title: "AI Analysis",
      description: "The LangGraph agent checks comfort boundaries and isolates electrical waste.",
      icon: <ClipboardList className="h-5 w-5 text-violet-500" />
    },
    {
      num: "04",
      title: "Generate Decisions",
      description: "Derive automated optimizations (e.g. adjust lighting dim factors, cool setpoints).",
      icon: <Cpu className="h-5 w-5 text-sky-500" />
    },
    {
      num: "05",
      title: "Apply Controls",
      description: "Directly override actuators and schedules within the running systems.",
      icon: <Settings className="h-5 w-5 text-indigo-500" />
    },
    {
      num: "06",
      title: "Measure Savings",
      description: "Verify building efficiency targets by comparing optimized performance vs baseline.",
      icon: <TrendingDown className="h-5 w-5 text-pink-500" />
    }
  ];

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden col-span-1 lg:col-span-3">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ChevronRight className="h-4.5 w-4.5 text-zinc-500" />
          How EcoLoop Works
        </CardTitle>
        <CardDescription>Continuous optimization pipeline of autonomous building agents</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="relative bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-900 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="font-mono text-zinc-400 border-zinc-200 dark:border-zinc-800 text-[10px] px-1.5 py-0.5">
                  {step.num}
                </Badge>
                <div className="p-2 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-lg shadow-sm">
                  {step.icon}
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
                  {step.title}
                </h4>
                <p className="text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
