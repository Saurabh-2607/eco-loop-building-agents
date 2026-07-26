"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Cpu, HardDrive, FileSpreadsheet, CloudSun } from "lucide-react";

export default function SystemStatus() {
  const { simState } = useAppStore();

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900/60 flex-shrink-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Settings className="h-4.5 w-4.5 text-neutral-500" />
          Runtime Environment
        </CardTitle>
        <CardDescription>Simulation model execution variables</CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5 flex-1 flex flex-col justify-between">
          {/* Active Model */}
          <div
            className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-3.5 flex items-center justify-between flex-1 gap-4"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileSpreadsheet className="h-4 w-4 text-neutral-400 flex-shrink-0" />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a3a3a3" }}>
                IDF Model
              </span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#171717" }} className="truncate">
              {simState.currentModel || "small_office.idf"}
            </span>
          </div>

          {/* Weather Profile */}
          <div
            className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-3.5 flex items-center justify-between flex-1 gap-4"
          >
            <div className="flex items-center gap-2 min-w-0">
              <CloudSun className="h-4 w-4 text-neutral-400 flex-shrink-0" />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a3a3a3" }}>
                Weather File
              </span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#171717" }} className="truncate" title={simState.currentWeather}>
              {simState.currentWeather ? simState.currentWeather.replace("USA_IL_", "") : "Chicago-OHare.epw"}
            </span>
          </div>

          {/* Speed Factor */}
          <div
            className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-3.5 flex items-center justify-between flex-1 gap-4"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Cpu className="h-4 w-4 text-neutral-400 flex-shrink-0" />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a3a3a3" }}>
                Execution Speed
              </span>
            </div>
            <Badge
              className="font-extrabold px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider flex items-center gap-1 border flex-shrink-0"
              style={{ backgroundColor: "#fafafa", borderColor: "#e5e5e5", color: "#737373" }}
            >
              {simState.speedMultiplier}x Realtime
            </Badge>
          </div>

          {/* Run Identifiers */}
          <div
            className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-3.5 flex items-center justify-between flex-1 gap-4"
          >
            <div className="flex items-center gap-2 min-w-0">
              <HardDrive className="h-4 w-4 text-neutral-400 flex-shrink-0" />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a3a3a3" }}>
                Run ID
              </span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#171717" }} className="font-mono truncate">
              {simState.runId || "—"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
