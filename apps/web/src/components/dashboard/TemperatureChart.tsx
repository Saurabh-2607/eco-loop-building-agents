"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { Thermometer } from "lucide-react";

export default function TemperatureChart() {
  const { metrics } = useAppStore();

  const chartData = metrics.map((m) => ({
    time: m.timestamp,
    Indoor: m.indoorTemp,
    Outdoor: m.outdoorTemp,
  }));

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Thermometer className="h-4.5 w-4.5 text-amber-500" />
            Thermal Analytics
          </CardTitle>
          <CardDescription>Indoor vs outdoor air temperatures</CardDescription>
        </div>
        {metrics.length > 0 && (
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Indoor ({chartData[chartData.length - 1]?.Indoor}°C)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-zinc-400" />
              <span className="text-zinc-600 dark:text-zinc-400">Outdoor ({chartData[chartData.length - 1]?.Outdoor}°C)</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                unit="°C"
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
              <Line 
                type="monotone" 
                dataKey="Indoor" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Outdoor" 
                stroke="#94a3b8" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
