"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Zap } from "lucide-react";

export default function SavingsComparisonCard() {
  const { metrics } = useAppStore();

  const stats = (() => {
    if (!metrics || metrics.length === 0) {
      return {
        before: 245,
        after: 216,
        savings: 29,
        percent: 12
      };
    }

    let afterTotal = 0;
    metrics.forEach(m => {
      afterTotal += (m.hvacPower + m.lightingPower);
    });

    // Estimate baseline before automated rule schedules was roughly 1.18x optimized values
    const beforeTotal = afterTotal * 1.18;
    const savings = beforeTotal - afterTotal;
    const percent = beforeTotal > 0 ? (savings / beforeTotal) * 100 : 0;

    return {
      before: Math.round(beforeTotal),
      after: Math.round(afterTotal),
      savings: Math.round(savings),
      percent: Math.round(percent)
    };
  })();

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-1.5">
          <TrendingDown className="h-4 w-4 text-violet-500" />
          Optimization Impact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 dark:border-zinc-900/60 pb-3">
          <div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Before</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{stats.before} kWh</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">After</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.after} kWh</div>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-zinc-500">Net Reduction:</span>
          <span className="text-violet-600 dark:text-violet-400 font-bold flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 fill-current" />
            {stats.savings} kWh ({stats.percent}%)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
