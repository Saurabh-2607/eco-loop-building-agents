"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Activity, Settings, TrendingDown, ClipboardList } from "lucide-react";

export default function AIAgentThinking() {
  const steps = [
    {
      label: "Input Data",
      value: "EnergyPlus Results",
      desc: "Reading dynamic hourly building telemetry parameters.",
      icon: Activity,
    },
    {
      label: "Analysis",
      value: "HVAC consumes 85% energy",
      desc: "Isolating mechanical load spikes during building load peaks.",
      icon: Brain,
    },
    {
      label: "Decision",
      value: "Optimize HVAC schedule",
      desc: "Modifying cooling setpoint maps and reducing fan speeds.",
      icon: Settings,
    },
    {
      label: "Expected Impact",
      value: "12% energy reduction",
      desc: "Projecting load reductions inside simulated runs.",
      icon: TrendingDown,
    },
    {
      label: "Result",
      value: "Measured savings",
      desc: "Checking verified database columns to validate energy savings.",
      icon: ClipboardList,
    }
  ];

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col">
      <CardHeader className="pb-2.5 border-b border-zinc-100 dark:border-zinc-900/60 flex-shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <Brain className="h-4.5 w-4.5 text-neutral-500" />
          AI Reasoning Timeline
        </CardTitle>
        <CardDescription className="text-[11px] leading-normal">Visualized LangGraph agent optimization process flow</CardDescription>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="bg-neutral-50/50 border border-neutral-100 rounded-2xl p-2.5 flex items-start gap-3"
              style={{ borderRadius: 16 }}
            >
              {/* Left Side: Icon Circle */}
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 12,
                  border: "1.5px solid #171717",
                  background: "#171717",
                  color: "#ffffff",
                }}
              >
                <Icon style={{ width: 12, height: 12 }} />
              </div>

              {/* Right Side: Text elements */}
              <div className="flex flex-col min-w-0">
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#a3a3a3",
                    lineHeight: 1.0,
                  }}
                >
                  Step {idx + 1}: {step.label}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#171717",
                    marginTop: 1,
                    lineHeight: 1.2,
                  }}
                >
                  {step.value}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#737373",
                    marginTop: 0.5,
                    lineHeight: 1.3,
                  }}
                >
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
