"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { Activity, Loader2 } from "lucide-react";

export default function EnergyChart() {
  const { metrics, simLoading } = useAppStore();

  // Map data to simple chart variables
  const chartData = metrics.map((m) => ({
    time: m.timestamp,
    HVAC: m.hvacPower,
    Lighting: m.lightingPower,
    Total: m.hvacPower + m.lightingPower,
  }));

  if (simLoading) {
    return (
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm col-span-1 lg:col-span-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-emerald-500" />
            Energy Consumption
          </CardTitle>
          <CardDescription>Real-time electrical load breakdown (HVAC and Lighting)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center text-zinc-450 dark:text-zinc-500 animate-pulse bg-zinc-50/20 dark:bg-zinc-950/20">
            <Loader2 className="h-8 w-8 mb-2 animate-spin text-zinc-350 dark:text-zinc-700" />
            <p className="text-sm font-semibold text-zinc-500">Querying telemetry database...</p>
            <p className="text-xs max-w-xs mt-1">Retrieving timeseries metrics from backend database.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (metrics.length === 0) {

    return (
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm col-span-1 lg:col-span-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-emerald-500" />
            Energy Consumption
          </CardTitle>
          <CardDescription>Real-time electrical load breakdown (HVAC and Lighting)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-805/60 rounded-lg p-6 text-center text-zinc-400">
            <Activity className="h-8 w-8 mb-2 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm font-semibold text-zinc-500">No live telemetry available</p>
            <p className="text-xs max-w-xs mt-1">Start a simulation process to begin receiving real-time energy usage records.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-emerald-500" />
            Energy Consumption
          </CardTitle>
          <CardDescription>Real-time electrical load breakdown (HVAC and Lighting)</CardDescription>
        </div>
        {metrics.length > 0 && (
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-600 dark:text-zinc-400">HVAC ({chartData[chartData.length - 1]?.HVAC} kW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Lighting ({chartData[chartData.length - 1]?.Lighting} kW)</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hvacGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                unit=" kW"
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
              />
              <Area 
                type="monotone" 
                dataKey="HVAC" 
                stackId="1"
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#hvacGrad)" 
              />
              <Area 
                type="monotone" 
                dataKey="Lighting" 
                stackId="1"
                stroke="#0ea5e9" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#lightGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
