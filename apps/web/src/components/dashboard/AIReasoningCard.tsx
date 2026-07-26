"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, ThumbsUp, ThumbsDown, Thermometer, Sun } from "lucide-react";

export default function AIReasoningCard() {
  const { decisions, submitFeedback } = useAppStore();

  // Get the most recent decision
  const latestDecision = decisions[0];

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Cpu className="h-4.5 w-4.5 text-neutral-500" />
              Active AI Optimization Decision
            </CardTitle>
            <CardDescription>Most recent control recommendation and reasoning</CardDescription>
          </div>
          {latestDecision && (
            <Badge variant="outline" className="font-semibold text-zinc-500 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              Model: {latestDecision.modelName}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between p-4">
        {!latestDecision ? (
          <div className="text-sm text-zinc-500 text-center py-8">No optimization logs available. Trigger an optimization first.</div>
        ) : (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            {/* Targets Setpoints */}
            <div className="grid grid-cols-2 gap-3">
              {/* HVAC setpoint target */}
              <div className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-4 flex items-center gap-4">
                <div className="p-3 bg-neutral-100 text-neutral-500 rounded-full">
                  <Thermometer className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">HVAC Target</div>
                  <div className="text-xl font-bold text-neutral-900 mt-0.5">
                    {latestDecision.hvacSetpoint.toFixed(1)}°C
                  </div>
                </div>
              </div>

              {/* Lighting target */}
              <div className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-4 flex items-center gap-4">
                <div className="p-3 bg-neutral-100 text-neutral-500 rounded-full">
                  <Sun className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Lighting Target</div>
                  <div className="text-xl font-bold text-neutral-900 mt-0.5">
                    {latestDecision.lightingDim}%
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation text */}
            <div className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">Agent Rationale</span>
              <p className="text-sm text-neutral-800 leading-relaxed font-medium">
                {latestDecision.reason}
              </p>
            </div>

            {/* Validation review and telemetry details */}
            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-4 text-xs">
              <div className="text-zinc-400 dark:text-zinc-500 font-semibold">
                Token Count: <span className="font-mono">{latestDecision.tokensConsumed}</span> | Status: <span className="capitalize">{latestDecision.feedbackStatus}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold mr-1">Feedback:</span>
                <Button
                  size="sm"
                  variant={latestDecision.feedbackStatus === "correct" ? "default" : "outline"}
                  onClick={() => submitFeedback(latestDecision.id, "correct")}
                  className="h-8 px-3 text-xs flex items-center gap-1.5 font-medium"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Correct
                </Button>
                <Button
                  size="sm"
                  variant={latestDecision.feedbackStatus === "incorrect" ? "destructive" : "outline"}
                  onClick={() => submitFeedback(latestDecision.id, "incorrect")}
                  className="h-8 px-3 text-xs flex items-center gap-1.5 font-medium"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                  Incorrect
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
