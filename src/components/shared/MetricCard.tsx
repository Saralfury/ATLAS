"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { COUNTER_ANIMATION_DURATION_MS, COUNTER_START_DELAY_MS } from "@/lib/animation";

export function MetricCard({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  const display = useCountUp(value, COUNTER_ANIMATION_DURATION_MS, COUNTER_START_DELAY_MS);
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong className="font-tabular">
        {display.toLocaleString("en-IN", { maximumFractionDigits: value < 1000 ? 1 : 0 })}
        {suffix}
      </strong>
    </div>
  );
}
