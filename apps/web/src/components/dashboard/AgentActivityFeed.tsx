"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AgentActivityFeed() {
  const { logs } = useAppStore();

  const getLogServiceCategory = (service: string) => {
    switch (service.toLowerCase()) {
      case "simulator":
        return { label: "SIMULATOR", variant: "simulator", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
      case "frontend":
      case "backend":
        return { label: "SYSTEM", variant: "system", color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" };
      case "agent":
        return { label: "AI AGENT", variant: "agent", color: "bg-violet-500/10 text-violet-500 border-violet-500/20" };
      case "optimizer":
        return { label: "OPTIMIZER", variant: "optimizer", color: "bg-sky-500/10 text-sky-500 border-sky-500/20" };
      default:
        return { label: "TELEMETRY", variant: "telemetry", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    }
  };

  const displayedLogs = logs.slice(0, 6);

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60 flex-shrink-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Terminal className="h-4.5 w-4.5 text-zinc-500" />
          Agent Activity Feed
        </CardTitle>
        <CardDescription>Real-time telemetry stream from active network nodes</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4 font-mono text-xs overflow-y-auto select-text min-h-[300px]">
        {displayedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 py-12 text-center">
            <ClipboardList className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
            <p className="font-semibold text-sm">Awaiting simulation events...</p>
            <p className="text-[10px] max-w-xs mt-1">Start a simulation process to begin logging system loop transactions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedLogs.map((log) => {
              const cat = getLogServiceCategory(log.service);
              return (
                <div key={log.id} className="flex items-start gap-3 text-[11px] leading-relaxed border-b border-zinc-100 dark:border-zinc-900/40 pb-3 last:border-0 last:pb-0">
                  <span className="text-zinc-500 font-semibold">{log.timestamp}</span>
                  <Badge variant="outline" className={cn("font-bold text-[9px] px-1.5 py-0 rounded flex-shrink-0", cat.color)}>
                    {cat.label}
                  </Badge>
                  <span className="text-zinc-800 dark:text-zinc-350">{log.message}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
