"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

export default function RecentActions() {
  const { logs } = useAppStore();

  // Extract the latest 5 entries
  const recentLogs = logs.slice(0, 5);

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm col-span-1">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ClipboardList className="h-4.5 w-4.5 text-zinc-500" />
          Recent Actions
        </CardTitle>
        <CardDescription>Latest events emitted from backend loop</CardDescription>
      </CardHeader>
      <CardContent>
        {recentLogs.length === 0 ? (
          <div className="text-sm text-zinc-500 text-center py-6">No recent actions recorded.</div>
        ) : (
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex gap-3 text-xs">
                {/* Log Severity indicator */}
                <div className="flex flex-col items-center">
                  <div 
                    className={cn(
                      "h-2.5 w-2.5 rounded-full mt-1.5 ring-4",
                      log.level === "INFO" && "bg-emerald-500 ring-emerald-500/10",
                      log.level === "WARNING" && "bg-amber-500 ring-amber-500/10",
                      log.level === "ERROR" && "bg-rose-500 ring-rose-500/10",
                      log.level === "CRITICAL" && "bg-rose-700 ring-rose-700/10"
                    )}
                  />
                  <div className="flex-1 w-px bg-zinc-100 dark:bg-zinc-900 my-1" />
                </div>

                {/* Log description */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded",
                      log.service === "agent" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      log.service === "simulator" && "bg-sky-500/10 text-sky-600 dark:text-sky-400",
                      log.service === "backend" && "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
                      log.service === "database" && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    )}>
                      {log.service}
                    </span>
                    <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[10px]">{log.timestamp}</span>
                  </div>
                  <p className="mt-1 text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {log.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
