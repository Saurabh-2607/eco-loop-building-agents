"use client";

import { Card, CardContent } from "@/components/ui/card";
import InfoTooltip from "@/components/dashboard/InfoTooltip";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  loading?: boolean;
}

const TOOLTIP_MAP: Record<string, string> = {
  "Energy Demand": "Sum of total real-time electrical loads (HVAC and lighting) active in the building zone.",
  "Indoor Temperature": "Mean dry-bulb temperature measured inside the zone. Optimal comfort range is 21.0°C - 23.5°C.",
  "Building Occupancy": "Simulated live count of active building occupants inside the monitored office zone.",
  "Carbon & Cost Savings": "Calculated optimization efficiency yield compared against baseline ASHRAE schedules."
};

export default function MetricCard({
  title,
  value,
  unit,
  change,
  loading = false,
}: MetricCardProps) {
  const isPlaceholder = typeof value === "string" && (value === "—" || value.includes("No"));
  const tooltipText = TOOLTIP_MAP[title] || "Operational telemetry parameter.";

  return (
    <Card
      className="h-full"
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 16,
        background: "#ffffff",
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        style={{
          padding: "24px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top: Title with Helper Tooltip */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          <p
            style={{
              fontSize: 14,
              fontWeight: 650,
              color: "#737373",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            {title}
          </p>
          <InfoTooltip content={tooltipText} />
        </div>

        {/* Bottom: Value & Change rate */}
        <div style={{ marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
            {loading ? (
              <div
                style={{
                  width: 100,
                  height: 48,
                  borderRadius: 4,
                  background: "#f5f5f5",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ) : (
              <>
                <span
                  style={{
                    fontSize: isPlaceholder ? 18 : 48,
                    fontWeight: 800,
                    color: isPlaceholder ? "#d4d4d4" : "#171717",
                    letterSpacing: isPlaceholder ? 0 : "-0.05em",
                    lineHeight: 1.0,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {isPlaceholder ? "—" : value}
                </span>
                {unit && !isPlaceholder && (
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#a3a3a3",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {unit}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Change rate */}
          {!loading && change && !isPlaceholder && (
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#a3a3a3",
                marginTop: 8,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {change} vs last hr
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
