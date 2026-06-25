"use client";

import { useCallback, useEffect } from "react";

import { MetricCard } from "@/components/shared/MetricCard";
import { useCascadeAnimation } from "@/hooks/useCascadeAnimation";
import { formatEconomicImpact, formatTEU } from "@/lib/formatters";
import { useAtlasStore } from "@/store";
import type { PortStatus } from "@/types/simulation.types";

export function DamageReport() {
  const result = useAtlasStore((state) => state.currentResult);
  const currentHop = useAtlasStore((state) => state.currentHop);
  const setPortStatus = useAtlasStore((state) => state.setPortStatus);
  const setActiveCanvas = useAtlasStore((state) => state.setActiveCanvas);
  const resetPortStatuses = useAtlasStore((state) => state.resetPortStatuses);
  const onPortStateChange = useCallback((portId: string, status: PortStatus) => setPortStatus(portId, status), [setPortStatus]);
  const { startAnimation, resetAnimation } = useCascadeAnimation(onPortStateChange);

  useEffect(() => {
    if (result) startAnimation(result);
  }, [result, startAnimation]);

  if (!result) return null;

  return (
    <section className="panel-card damage-report">
      <div className="panel-heading">
        <span>CASCADE DAMAGE REPORT</span>
        <button onClick={() => useAtlasStore.getState().setSimulationResult(null)}>NEW SIMULATION</button>
      </div>
      <h2>{result.impacted_ports[0]} SHOCK</h2>
      <div className="metric-grid">
        <MetricCard label="CASCADE SIZE" value={result.cascade_size} />
        <MetricCard label="STRANDED CARGO" value={result.stranded_cargo_teu} />
        <MetricCard label="DELAY DAYS" value={result.total_delay_days} />
        <MetricCard label="ECONOMIC IMPACT" value={result.total_delay_days * 0.8} suffix="B" />
      </div>
      <div className="timeline atlas-scrollbar">
        {result.state_transitions.map((item) => (
          <div key={`${item.port_id}-${item.hop}`} className={`timeline-row ${currentHop >= item.hop ? "visible" : ""}`}>
            <span>HOP {item.hop}</span>
            <strong>{item.port_name}</strong>
            <em>{item.transition.toUpperCase()}</em>
          </div>
        ))}
      </div>
      <div className="impact-card">
        <span>STRANDED CARGO</span>
        <strong>{formatTEU(result.stranded_cargo_teu)}</strong>
        <span>{formatEconomicImpact(result.total_delay_days)}</span>
      </div>
      <div className="action-row">
        <button onClick={() => { resetPortStatuses(); resetAnimation(); startAnimation(result); }}>REPLAY ANIMATION</button>
        <button onClick={() => setActiveCanvas("network")}>VIEW IN NETWORK</button>
      </div>
    </section>
  );
}
