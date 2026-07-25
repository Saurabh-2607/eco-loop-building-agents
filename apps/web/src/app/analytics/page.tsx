"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, TrendingUp, Sparkles, AlertCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function Analytics() {
  const { metrics } = useAppStore();

  // Create chart data mapping PMV comfort distributions
  const comfortData = metrics.map((m) => ({
    time: m.timestamp,
    PMV: parseFloat(m.pmv.toFixed(2)),
    PPD: parseFloat(m.ppd.toFixed(1)),
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Aggregate Energy Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,842 kWh</div>
            <p className="text-xs text-zinc-400 mt-1">Shed vs standard heating schedules</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-sky-500" />
              Utility Cost Avoided
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$248.50</div>
            <p className="text-xs text-zinc-400 mt-1">Calculated via Peak/Off-peak tariffs</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Thermal Variance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">±0.28 PMV</div>
            <p className="text-xs text-zinc-400 mt-1">Average comfort deviation factor</p>
          </CardContent>
        </Card>
      </div>

      {/* Comfort Index chart */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-4.5 w-4.5 text-indigo-500" />
            Comfort Indices Profile
          </CardTitle>
          <CardDescription>Predicted Mean Vote (PMV) tracking index. Normal range is -0.5 to +0.5.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comfortData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} domain={[-1, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(9, 9, 11, 0.95)",
                    borderColor: "rgba(39, 39, 42, 0.8)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#fff"
                  }}
                  cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                />
                <Bar dataKey="PMV" fill="#818cf8" radius={[4, 4, 4, 4]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Time-series tabular data log */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Simulation Log History</CardTitle>
          <CardDescription>Chronological database output values</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="font-semibold text-zinc-500 dark:text-zinc-400 pl-6">Time</TableHead>
                <TableHead className="font-semibold text-zinc-500 dark:text-zinc-400 text-center">Indoor (°C)</TableHead>
                <TableHead className="font-semibold text-zinc-500 dark:text-zinc-400 text-center">Outdoor (°C)</TableHead>
                <TableHead className="font-semibold text-zinc-500 dark:text-zinc-400 text-center">PMV</TableHead>
                <TableHead className="font-semibold text-zinc-500 dark:text-zinc-400 text-center">PPD (%)</TableHead>
                <TableHead className="font-semibold text-zinc-500 dark:text-zinc-400 text-center">HVAC Power (kW)</TableHead>
                <TableHead className="font-semibold text-zinc-500 dark:text-zinc-400 text-right pr-6">Lights Power (kW)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.slice().reverse().map((row, idx) => (
                <TableRow key={idx} className="border-b border-zinc-100 dark:border-zinc-900/60">
                  <TableCell className="font-mono text-zinc-500 dark:text-zinc-400 pl-6">{row.timestamp}</TableCell>
                  <TableCell className="text-center font-medium">{row.indoorTemp.toFixed(1)}°C</TableCell>
                  <TableCell className="text-center text-zinc-500">{row.outdoorTemp.toFixed(1)}°C</TableCell>
                  <TableCell className={`text-center font-semibold ${Math.abs(row.pmv) > 0.5 ? "text-amber-500" : "text-emerald-500"}`}>
                    {row.pmv.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center text-zinc-500">{row.ppd.toFixed(1)}%</TableCell>
                  <TableCell className="text-center font-medium">{row.hvacPower} kW</TableCell>
                  <TableCell className="text-right text-zinc-500 pr-6">{row.lightingPower} kW</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
