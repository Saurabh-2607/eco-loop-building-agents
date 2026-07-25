"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, Calendar, ChevronRight, ThumbsUp, ThumbsDown, CheckCircle, HelpCircle } from "lucide-react";

export default function AIDecisions() {
  const { decisions, submitFeedback } = useAppStore();

  const totalDecisions = decisions.length;
  const correctDecisions = decisions.filter(d => d.feedbackStatus === "correct").length;
  const incorrectDecisions = decisions.filter(d => d.feedbackStatus === "incorrect").length;
  const accuracyRate = totalDecisions > 0 
    ? Math.round(((correctDecisions) / (totalDecisions - decisions.filter(d => d.feedbackStatus === "unrated").length || 1)) * 100) 
    : 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Accuracy stats summaries */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Optimization Cycles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDecisions}</div>
            <p className="text-xs text-zinc-400 mt-1">Total model execution calls</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-500">Correct Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{correctDecisions}</div>
            <p className="text-xs text-zinc-400 mt-1">Confirmed by building operator</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-500">Incorrect Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{incorrectDecisions}</div>
            <p className="text-xs text-zinc-400 mt-1">Rejected by operator overrides</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-500">Agent Accuracy Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{correctDecisions + incorrectDecisions > 0 ? `${accuracyRate}%` : "100%"}</div>
            <p className="text-xs text-zinc-400 mt-1">Evaluated criteria accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Decisions timeline log list */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-zinc-500" />
            Decision Audit Timeline
          </CardTitle>
          <CardDescription>Historical ledger of all LLM optimization setpoint triggers</CardDescription>
        </CardHeader>
        <CardContent>
          {decisions.length === 0 ? (
            <div className="text-sm text-zinc-500 text-center py-8">No decisions logged.</div>
          ) : (
            <div className="space-y-6">
              {decisions.map((dec, idx) => (
                <div key={dec.id} className="relative flex gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-900/60 last:border-b-0 last:pb-0">
                  {/* Visual timeline connector connector */}
                  {idx < decisions.length - 1 && (
                    <div className="absolute top-8 left-4 w-0.5 h-full bg-zinc-100 dark:bg-zinc-900" />
                  )}

                  {/* Icon badge */}
                  <div className="h-9 w-9 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center flex-shrink-0 z-10 text-zinc-400 dark:text-zinc-500">
                    <Cpu className="h-4 w-4" />
                  </div>

                  {/* Decision Content body card */}
                  <div className="flex-1 space-y-4">
                    {/* Timestamp, setpoints list and model labels */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-950 dark:text-white">Optimization Cycle</span>
                        <Badge variant="secondary" className="font-semibold text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {dec.id}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500 font-mono">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(dec.timestamp).toLocaleString()}
                      </div>
                    </div>

                    {/* Setpoints grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-lg">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">HVAC Target</div>
                        <div className="text-sm font-semibold text-zinc-950 dark:text-white mt-1">{dec.hvacSetpoint.toFixed(1)}°C</div>
                      </div>
                      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-lg">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Lighting Target</div>
                        <div className="text-sm font-semibold text-zinc-950 dark:text-white mt-1">{dec.lightingDim}% Dim</div>
                      </div>
                      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-lg">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Reasoning LLM</div>
                        <div className="text-sm font-semibold text-zinc-950 dark:text-white mt-1">{dec.modelName}</div>
                      </div>
                    </div>

                    {/* Reasoning description box */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-lg">
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                        {dec.reason}
                      </p>
                    </div>

                    {/* Footer telemetry details and validation reviews */}
                    <div className="flex items-center justify-between text-xs border-t border-zinc-100 dark:border-zinc-900/60 pt-3">
                      <div className="text-zinc-400 dark:text-zinc-500 font-semibold font-mono">
                        Prompt tokens: {dec.tokensConsumed}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Label badge */}
                        {dec.feedbackStatus === "correct" && (
                          <Badge variant="outline" className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 mr-2">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Operator Approved
                          </Badge>
                        )}
                        {dec.feedbackStatus === "incorrect" && (
                          <Badge variant="outline" className="font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/5 mr-2">
                            <HelpCircle className="h-3 w-3 mr-1" />
                            Operator Overridden
                          </Badge>
                        )}
                        
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => submitFeedback(dec.id, "correct")}
                          className={`h-7 px-2.5 text-xs flex items-center gap-1 font-semibold ${dec.feedbackStatus === "correct" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""}`}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => submitFeedback(dec.id, "incorrect")}
                          className={`h-7 px-2.5 text-xs flex items-center gap-1 font-semibold ${dec.feedbackStatus === "incorrect" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : ""}`}
                        >
                          <ThumbsDown className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
