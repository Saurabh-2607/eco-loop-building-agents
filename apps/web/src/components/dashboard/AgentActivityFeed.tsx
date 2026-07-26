"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import InfoTooltip from "@/components/dashboard/InfoTooltip";

export default function AgentActivityFeed() {
  const { logs } = useAppStore();

  const getLogServiceCategory = (service: string) => {
    switch (service.toLowerCase()) {
      case "simulator":
        return { label: "SIMULATOR", variant: "simulator", color: "bg-neutral-100 text-neutral-600 border-neutral-200" };
      case "frontend":
      case "backend":
        return { label: "SYSTEM", variant: "system", color: "bg-neutral-100 text-neutral-600 border-neutral-200" };
      case "agent":
        return { label: "AI AGENT", variant: "agent", color: "bg-neutral-900 text-white border-neutral-900" };
      case "optimizer":
        return { label: "OPTIMIZER", variant: "optimizer", color: "bg-neutral-100 text-neutral-600 border-neutral-200" };
      default:
        return { label: "TELEMETRY", variant: "telemetry", color: "bg-neutral-100 text-neutral-600 border-neutral-200" };
    }
  };

  const displayedLogs = logs.slice(0, 6);

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60 flex-shrink-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Terminal className="h-4.5 w-4.5 text-neutral-500" />
          Agent Activity Feed
          <InfoTooltip content="Real-time transaction stream from operational nodes, recording simulator steps, LLM audit triggers, and actuation feedback." />
        </CardTitle>
        <CardDescription>Real-time telemetry stream from active network nodes</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4 font-mono text-xs overflow-y-auto select-text min-h-[300px] flex flex-col justify-between">
        {displayedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-12 text-center flex-1">
            <ClipboardList className="h-8 w-8 text-neutral-300 mb-2" />
            <p className="font-semibold text-sm">Awaiting simulation events...</p>
            <p className="text-[10px] max-w-xs mt-1">Start a simulation process to begin logging system loop transactions.</p>
          </div>
        ) : (
          <div className="space-y-2 flex-1 flex flex-col justify-between">
            {displayedLogs.map((log) => {
              const cat = getLogServiceCategory(log.service);
              return (
                <div
                  key={log.id}
                  className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-3.5 flex items-center gap-3 text-[11px] leading-relaxed flex-1 py-2"
                >
                  <span className="text-neutral-400 font-semibold flex-shrink-0" style={{ fontSize: 10 }}>
                    {log.timestamp}
                  </span>
                  <Badge variant="outline" className={cn("font-bold text-[9px] px-1.5 py-0 rounded flex-shrink-0", cat.color)}>
                    {cat.label}
                  </Badge>
                  <span className="text-neutral-900 font-medium flex-1 text-xs" style={{ fontSize: 11 }}>
                    {log.message}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
