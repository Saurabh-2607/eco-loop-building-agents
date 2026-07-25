"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Cpu, HardDrive, FileSpreadsheet, CloudSun } from "lucide-react";

export default function SystemStatus() {
  const { simState } = useAppStore();

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Settings className="h-4.5 w-4.5 text-zinc-500" />
          Runtime Environment
        </CardTitle>
        <CardDescription>Simulation model execution variables</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Model */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">IDF Model</span>
          </div>
          <span className="text-sm font-semibold text-zinc-950 dark:text-white truncate max-w-[180px]">
            {simState.currentModel}
          </span>
        </div>

        {/* Weather Profile */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <CloudSun className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Weather File</span>
          </div>
          <span className="text-sm font-semibold text-zinc-950 dark:text-white truncate max-w-[180px]" title={simState.currentWeather}>
            {simState.currentWeather.split("_")[0]}...epw
          </span>
        </div>

        {/* Speed Factor */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Execution Speed</span>
          </div>
          <Badge variant="outline" className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
            {simState.speedMultiplier}x Realtime
          </Badge>
        </div>

        {/* Run Identifiers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Run ID</span>
          </div>
          <span className="text-xs font-mono text-zinc-500 truncate max-w-[160px]" title={simState.runId}>
            {simState.runId.slice(0, 13)}...
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
