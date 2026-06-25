"use client";

import { useState } from "react";

import { AiForecastPanel } from "@/components/analysis/AiForecastPanel";
import { RadarChartPanel } from "@/components/shared/RadarChartPanel";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { simulateDisruption } from "@/lib/api";
import { riskScoreToColor } from "@/lib/colors";
import { PORT_BY_ID } from "@/lib/portData";
import { useAtlasStore } from "@/store";

export function PortRiskBreakdown({ portId }: { portId: string }) {
  const [tab, setTab] = useState<"risk" | "forecast">("risk");
  const risk = useAtlasStore((state) => state.riskData[portId]);
  const port = PORT_BY_ID.get(Number(portId));

  if (!port) return null;
  if (!risk) return <SkeletonLoader lines={6} />;

  const runSimulation = async () => {
    const store = useAtlasStore.getState();
    store.setIsLoading(true);
    store.setPortStatus(portId, "analyzing");
    try {
      const result = await simulateDisruption(port.name, store.severity);
      store.setSimulationResult(result);
      store.incrementSimulationCount();
    } finally {
      store.setIsLoading(false);
    }
  };

  return (
    <section className="panel-card">
      <div className="panel-heading">
        <span>PORT ANALYSIS</span>
        <button onClick={() => useAtlasStore.getState().setSelectedPortId(null)}>NEW SIMULATION</button>
      </div>
      <h2>{port.name}</h2>
      <div className="risk-hero">
        <span>CRITICALITY RANK {risk.criticality_rank} OF 30</span>
        <strong style={{ color: riskScoreToColor(risk.risk_score) }}>{risk.risk_score.toFixed(1)}</strong>
      </div>
      <div className="tab-row">
        <button className={tab === "risk" ? "active" : ""} onClick={() => setTab("risk")}>RISK BREAKDOWN</button>
        <button className={tab === "forecast" ? "active" : ""} onClick={() => setTab("forecast")}>AI FORECAST</button>
      </div>
      {tab === "risk" ? <RadarChartPanel portId={portId} /> : <AiForecastPanel portId={portId} />}
      <button className="simulate-button" onClick={runSimulation}>SIMULATE {useAtlasStore.getState().severity}% DISRUPTION</button>
    </section>
  );
}
