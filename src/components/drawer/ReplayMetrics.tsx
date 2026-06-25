"use client";

import { formatDelayDays, formatTEU } from "@/lib/formatters";
import { useAtlasStore } from "@/store";

export function ReplayMetrics() {
  const replay = useAtlasStore((state) => state.replayData);
  if (!replay) return <div className="replay-metrics">Select a run to compare before and after states.</div>;
  const after = replay.after_state;
  return (
    <div className="replay-metrics">
      <span>CASCADE {after.cascade_size}</span>
      <span>{formatTEU(after.stranded_cargo_teu)}</span>
      <span>{formatDelayDays(after.total_delay_days)}</span>
      <span>{after.impacted_ports.length} PORTS AFFECTED</span>
    </div>
  );
}
