"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { Sun, Loader2 } from "lucide-react";

export default function LightingUsageChart() {
  const { metrics, simLoading } = useAppStore();

  const chartData = metrics.map((m) => ({
    time: m.timestamp,
    Lighting: m.lightingPower,
  }));

  if (simLoading) {
    return (
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm h-full flex flex-col">
        <CardHeader className="pb-4 flex-shrink-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sun className="h-4.5 w-4.5 text-sky-500" />
            Lighting Usage Graph
          </CardTitle>
          <CardDescription>Real-time interior lighting electricity demand</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-4">
          <div className="h-60 w-full flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center bg-zinc-50/20 dark:bg-zinc-950/20">
            <Loader2 className="h-7 w-7 mb-2 animate-spin text-zinc-350 dark:text-zinc-700" />
            <p className="text-xs font-semibold text-neutral-500">Querying telemetry database...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (metrics.length === 0) {
    return (
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm h-full flex flex-col">
        <CardHeader className="pb-4 flex-shrink-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sun className="h-4.5 w-4.5 text-sky-500" />
            Lighting Usage Graph
          </CardTitle>
          <CardDescription>Real-time interior lighting electricity demand</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-4">
          <div className="h-60 w-full flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-zinc-400">
            <Loader2 className="h-6 w-6 mb-2 animate-spin text-neutral-450" />
            <p className="text-xs font-semibold text-neutral-500">Waiting for live simulation data...</p>
            <p className="text-[10px] text-zinc-400 max-w-xs mt-1">Telemetry events will plot automatically once the engine boots.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sun className="h-4.5 w-4.5 text-sky-500" />
            Lighting Usage Graph
          </CardTitle>
          <CardDescription>Real-time interior lighting electricity demand</CardDescription>
        </div>
        <div className="text-xs font-bold text-neutral-800">
          Last: {chartData[chartData.length - 1]?.Lighting} kW
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="lightSoloGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-zinc-900" />
              <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} unit=" kW" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171717",
                  borderColor: "#262626",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff"
                }}
                labelStyle={{ fontWeight: "bold", color: "#a3a3a3" }}
              />
              <Area type="monotone" dataKey="Lighting" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#lightSoloGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
