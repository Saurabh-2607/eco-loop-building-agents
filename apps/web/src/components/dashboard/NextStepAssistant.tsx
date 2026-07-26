"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, X, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function NextStepAssistant() {
  const { simState, aiReport } = useAppStore();
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const simStatus = simState.status;

  // Reset visibility when step changes to keep helping the user
  useEffect(() => {
    setTimeout(() => setVisible(true), 0);
  }, [simStatus, aiReport]);

  if (!visible) return null;

  const currentStep = (() => {
    if (simState.status === "idle" && pathname !== "/simulation") {
      return {
        message: "No simulation run started yet. Start your first simulator test run.",
        actionLabel: "Start Simulation",
        route: "/simulation"
      };
    }
    if (simState.status === "running" && pathname !== "/simulation") {
      return {
        message: "EnergyPlus simulation is running in the background.",
        actionLabel: "Monitor Logs",
        route: "/simulation"
      };
    }
    if (simState.status === "finished" && !aiReport && pathname !== "/ai-decisions") {
      return {
        message: "Simulation finished. Next, generate the LangGraph agent optimization report.",
        actionLabel: "Generate AI Report",
        route: "/ai-decisions"
      };
    }
    if (simState.status === "finished" && aiReport && pathname !== "/ai-decisions") {
      return {
        message: "AI agent report is ready. Evaluate recommended HVAC and lighting controls.",
        actionLabel: "Review Recommendations",
        route: "/ai-decisions"
      };
    }
    return null;
  })();

  if (!currentStep) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce" style={{ animationDuration: "3s" }}>
      <Card className="max-w-xs p-4 relative select-none">
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 h-6 w-6 text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </Button>

        <CardContent className="p-0 space-y-3">
          <div className="flex gap-2.5 items-start">
            <div className="h-7 w-7 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center flex-shrink-0 border border-violet-500/20">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div className="space-y-0.5 pr-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">EcoLoop Assistant</h4>
              <p className="text-[11px] font-semibold text-foreground leading-relaxed">
                {currentStep.message}
              </p>
            </div>
          </div>

          <Button 
            size="sm"
            onClick={() => router.push(currentStep.route)}
            className="w-full text-[10px] h-7"
          >
            <Sparkles className="h-3 w-3 fill-current" />
            {currentStep.actionLabel}
            <ArrowRight className="h-3 w-3" />
          </Button>
        </CardContent>

      </Card>
    </div>
  );
}
