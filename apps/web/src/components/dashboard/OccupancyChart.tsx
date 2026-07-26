"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { Users } from "lucide-react";

export default function OccupancyChart() {
  const { metrics } = useAppStore();

  const chartData = metrics.map((m) => ({
    time: m.timestamp,
    Occupants: m.occupancyCount,
  }));

  if (metrics.length === 0) {
    return (
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-indigo-500" />
            Occupancy Statistics
          </CardTitle>
          <CardDescription>Zone occupancy density tracker</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-805/60 rounded-lg p-6 text-center text-zinc-400">
            <Users className="h-8 w-8 mb-2 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm font-semibold text-zinc-500">No live telemetry available</p>
            <p className="text-xs max-w-xs mt-1">Start a simulation process to begin receiving real-time occupancy records.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-indigo-500" />
            Occupancy Statistics
          </CardTitle>
          <CardDescription>Zone occupancy density tracker</CardDescription>
        </div>
        {metrics.length > 0 && (
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Current: {chartData[chartData.length - 1]?.Occupants} Persons
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-zinc-900" />
              <XAxis 
                dataKey="time" 
                stroke="#71717a" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(9, 9, 11, 0.95)", 
                  borderColor: "rgba(39, 39, 42, 0.8)", 
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#fff"
                }}
                labelStyle={{ fontWeight: "bold", color: "#a1a1aa" }}
                cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
              />
              <Bar 
                dataKey="Occupants" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
