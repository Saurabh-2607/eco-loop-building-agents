"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { Thermometer, Loader2 } from "lucide-react";

export default function TemperatureChart() {
  const { metrics, simLoading } = useAppStore();

  const chartData = metrics.map((m) => ({
    time: m.timestamp,
    Indoor: m.indoorTemp,
    Outdoor: m.outdoorTemp,
  }));

  if (simLoading) {
    return (
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm h-full flex flex-col">
        <CardHeader className="pb-4 flex-shrink-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Thermometer className="h-4.5 w-4.5 text-amber-500" />
            Thermal Analytics
          </CardTitle>
          <CardDescription>Indoor vs outdoor air temperatures</CardDescription>
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
            <Thermometer className="h-4.5 w-4.5 text-amber-500" />
            Thermal Analytics
          </CardTitle>
          <CardDescription>Indoor vs outdoor air temperatures</CardDescription>
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
            <Thermometer className="h-4.5 w-4.5 text-amber-500" />
            Thermal Analytics
          </CardTitle>
          <CardDescription>Indoor vs outdoor air temperatures</CardDescription>
        </div>
        {metrics.length > 0 && (
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-zinc-650 dark:text-zinc-400">Indoor ({chartData[chartData.length - 1]?.Indoor}°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-zinc-400" />
              <span className="text-zinc-650 dark:text-zinc-400">Outdoor ({chartData[chartData.length - 1]?.Outdoor}°C)</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-zinc-900" />
              <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} unit="°C" domain={["dataMin - 2", "dataMax + 2"]} />
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
              <Line type="monotone" dataKey="Indoor" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="Outdoor" stroke="#94a3b8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
