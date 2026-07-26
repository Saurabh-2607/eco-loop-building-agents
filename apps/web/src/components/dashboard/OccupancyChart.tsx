"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { Users, Loader2 } from "lucide-react";

export default function OccupancyChart() {
  const { metrics, simLoading } = useAppStore();

  const chartData = metrics.map((m) => ({
    time: m.timestamp,
    Occupants: m.occupancyCount,
  }));

  if (simLoading) {
    return (
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm h-full flex flex-col">
        <CardHeader className="pb-4 flex-shrink-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-indigo-500" />
            Occupancy Statistics
          </CardTitle>
          <CardDescription>Zone occupancy density tracker</CardDescription>
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
            <Users className="h-4.5 w-4.5 text-indigo-500" />
            Occupancy Statistics
          </CardTitle>
          <CardDescription>Zone occupancy density tracker</CardDescription>
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
            <Users className="h-4.5 w-4.5 text-indigo-500" />
            Occupancy Statistics
          </CardTitle>
          <CardDescription>Zone occupancy density tracker</CardDescription>
        </div>
        {metrics.length > 0 && (
          <div className="text-xs font-bold text-neutral-800">
            Current: {chartData[chartData.length - 1]?.Occupants} Persons
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-zinc-900" />
              <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171717",
                  borderColor: "#262626",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff"
                }}
                labelStyle={{ fontWeight: "bold", color: "#a3a3a3" }}
                cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
              />
              <Bar dataKey="Occupants" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
