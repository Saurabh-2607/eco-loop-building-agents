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
    const seen = localStorage.getItem("ecoloop_onboarding_seen");
    if (!seen) {
      setTimeout(() => setOpen(true), 0);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("ecoloop_onboarding_seen", "true");
    setOpen(false);
  };

  const handleStartSim = () => {
    handleDismiss();
    router.push("/simulation");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xl rounded-2xl select-none">
        <DialogHeader className="space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <Sparkles className="h-6 w-6 fill-current" />
          </div>
          <DialogTitle className="text-xl font-bold text-center text-zinc-900 dark:text-white">
            Welcome to EcoLoop
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-zinc-500 max-w-xs mx-auto">
            Autonomous Building Energy Management & Optimization Agent
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 space-y-4">
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 flex items-center justify-center font-bold text-xs text-zinc-500 flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                Simulate Your Building
              </h4>
              <p className="text-[11px] text-zinc-450 leading-relaxed dark:text-zinc-400 mt-0.5">
                Load custom building models and weather data schedules into the EnergyPlus thermal emulator.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 flex items-center justify-center font-bold text-xs text-zinc-500 flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                AI Performance Analysis
              </h4>
              <p className="text-[11px] text-zinc-450 leading-relaxed dark:text-zinc-400 mt-0.5">
                The LangGraph agent scans timeseries telemetry outputs to isolate heating, cooling, and lighting inefficiencies.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 flex items-center justify-center font-bold text-xs text-zinc-500 flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Apply Optimizations
              </h4>
              <p className="text-[11px] text-zinc-450 leading-relaxed dark:text-zinc-400 mt-0.5">
                Automatically submit actuation overrides to scheduling modules, reducing carbon footprints by up to 15%.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={handleDismiss} className="flex-1 font-semibold text-xs h-9 border border-zinc-200 text-zinc-600">
            Skip Intro
          </Button>
          <Button onClick={handleStartSim} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 shadow-[0_4px_12px_rgba(16,185,129,0.2)]">
            <PlayCircle className="h-4 w-4 mr-1.5 fill-current" />
            Start Simulation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
