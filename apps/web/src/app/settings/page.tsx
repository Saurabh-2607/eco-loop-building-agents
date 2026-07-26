"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cpu, ClipboardList, Info, BadgeAlert, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in select-none">
      {/* System Information */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-indigo-500" />
            System Information
          </CardTitle>
          <CardDescription>Operational hardware and execution profiles</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3 font-semibold text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-900/40">
              <span className="text-zinc-500 uppercase tracking-wider">Building Model</span>
              <span className="text-zinc-900 dark:text-zinc-100">Chicago Office Standard</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-900/40">
              <span className="text-zinc-500 uppercase tracking-wider">AI Model</span>
              <span className="text-zinc-900 dark:text-zinc-100">qwen3:8b</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-900/40">
              <span className="text-zinc-500 uppercase tracking-wider">Simulation Engine</span>
              <span className="text-zinc-900 dark:text-zinc-100">EnergyPlus</span>
            </div>
            <div className="flex justify-between items-center py-1.5 pt-2">
              <span className="text-zinc-500 uppercase tracking-wider">Status</span>
              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                OPERATIONAL
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About EcoLoop */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Info className="h-4.5 w-4.5 text-zinc-500" />
            About EcoLoop
          </CardTitle>
          <CardDescription>Intelligent Building Energy Orchestrator</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-xs leading-relaxed text-zinc-650 dark:text-zinc-400 font-medium">
            EcoLoop is an autonomous system that balances occupant comfort and energy efficiency. 
            By building a closed feedback loop between physical simulations and cognitive reasoning agents, 
            it delivers optimal setpoint overrides dynamically.
          </p>
          
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Core Features</h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-zinc-600 dark:text-zinc-350">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                EnergyPlus Digital Twin
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                LangGraph Multi-Node Reasoning
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                Rule-Based Guardrails
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Real-Time Telemetry Streaming
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
