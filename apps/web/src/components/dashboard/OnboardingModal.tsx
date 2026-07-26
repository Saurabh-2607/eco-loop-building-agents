"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const seen = localStorage.getItem("ecoloop_onboarding_completed");
    if (!seen) {
      setTimeout(() => setOpen(true), 0);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("ecoloop_onboarding_completed", "true");
    setOpen(false);
  };

  const handleStartSim = () => {
    handleDismiss();
    router.push("/simulation");
  };

  const onboardingSteps = [
    { num: 1, title: "Run EnergyPlus simulation", desc: "Start runtime emulators with standard Chicago Office schedules." },
    { num: 2, title: "AI analyzes building behavior", desc: "The LangGraph agent checks raw metrics to find heating/cooling issues." },
    { num: 3, title: "Agent generates optimization decisions", desc: "Derive recommended temperature ranges and light output settings." },
    { num: 4, title: "System applies improvements", desc: "Send automated override setpoints back into operational loops." },
    { num: 5, title: "Measure savings", desc: "Aggregated analytics tables chart utility saving percentages." }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-6 select-none">
        <DialogHeader className="space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <Sparkles className="h-6 w-6 fill-current animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-bold text-center text-foreground">

            Welcome to EcoLoop
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-zinc-500 max-w-xs mx-auto">
            Your Autonomous AI Building Optimization Agent
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 space-y-4">
          {onboardingSteps.map((step) => (
            <div key={step.num} className="flex gap-3">
              <div className="h-7 w-7 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 flex items-center justify-center font-bold text-xs text-zinc-500 flex-shrink-0">
                {step.num}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {step.title}
                </h4>
                <p className="text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={handleDismiss} className="flex-1 text-xs h-9">
            Skip Intro
          </Button>
          <Button onClick={handleStartSim} className="flex-1 text-xs h-9">
            <PlayCircle className="h-4 w-4 mr-1.5 fill-current" />
            Start Simulation
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
