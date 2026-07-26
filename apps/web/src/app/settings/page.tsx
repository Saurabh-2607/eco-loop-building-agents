"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cpu, Info, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in select-none">
      {/* System Information */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60 flex-shrink-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-neutral-500" />
            System Information
          </CardTitle>
          <CardDescription>Operational hardware and execution profiles</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-2.5">
          {/* Building Model */}
          <div
            className="bg-neutral-50/50 border border-neutral-100 rounded-xl p-3 flex items-center justify-between"
            style={{ borderRadius: 12 }}
          >
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Building Model</span>
            <span className="text-sm font-semibold text-neutral-900">Chicago Office Standard</span>
          </div>

          {/* AI Model */}
          <div
            className="bg-neutral-50/50 border border-neutral-100 rounded-xl p-3 flex items-center justify-between"
            style={{ borderRadius: 12 }}
          >
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">AI Model</span>
            <span className="text-sm font-semibold text-neutral-900 font-mono">qwen3:8b</span>
          </div>

          {/* Simulation Engine */}
          <div
            className="bg-neutral-50/50 border border-neutral-100 rounded-xl p-3 flex items-center justify-between"
            style={{ borderRadius: 12 }}
          >
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Simulation Engine</span>
            <span className="text-sm font-semibold text-neutral-900">EnergyPlus</span>
          </div>

          {/* Status */}
          <div
            className="bg-neutral-50/50 border border-neutral-100 rounded-xl p-3 flex items-center justify-between"
            style={{ borderRadius: 12 }}
          >
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Status</span>
            <Badge
              className="font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider flex items-center gap-1 border"
              style={{ backgroundColor: "#fafafa", borderColor: "#e5e5e5", color: "#737373" }}
            >
              <CheckCircle2 className="h-3 w-3" />
              OPERATIONAL
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* About EcoLoop */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60 flex-shrink-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Info className="h-4.5 w-4.5 text-neutral-500" />
            About EcoLoop
          </CardTitle>
          <CardDescription>Intelligent Building Energy Orchestrator</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div
            className="bg-neutral-50/50 border border-neutral-100 rounded-xl p-4"
            style={{ borderRadius: 12 }}
          >
            <p className="text-xs leading-relaxed text-neutral-600 font-medium">
              EcoLoop is an autonomous system that balances occupant comfort and energy efficiency.
              By building a closed feedback loop between physical simulations and cognitive reasoning agents,
              it delivers optimal setpoint overrides dynamically.
            </p>
          </div>

          <div
            className="bg-neutral-50/50 border border-neutral-100 rounded-xl p-4 space-y-3"
            style={{ borderRadius: 12 }}
          >
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Core Features</h4>
            <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-neutral-600">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                EnergyPlus Digital Twin
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                LangGraph Multi-Node Reasoning
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                Rule-Based Guardrails
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                Real-Time Telemetry Streaming
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
