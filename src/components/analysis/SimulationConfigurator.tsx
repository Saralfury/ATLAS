"use client";

import { useMemo, useState } from "react";

import { PortListItem } from "@/components/shared/PortListItem";
import { usePrediction } from "@/hooks/usePrediction";
import { simulateDisruption } from "@/lib/api";
import { PORTS, PORT_BY_ID } from "@/lib/portData";
import { formatDelayDays, formatPercent } from "@/lib/formatters";
import { useAtlasStore } from "@/store";

export function SimulationConfigurator() {
  const [search, setSearch] = useState("");
  const selectedPortId = useAtlasStore((state) => state.selectedPortId);
  const severity = useAtlasStore((state) => state.severity);
  const riskData = useAtlasStore((state) => state.riskData);
  const isLoading = useAtlasStore((state) => state.isLoading);
  const setSelectedPortId = useAtlasStore((state) => state.setSelectedPortId);
  const setSeverity = useAtlasStore((state) => state.setSeverity);
  const selectedPort = selectedPortId ? PORT_BY_ID.get(Number(selectedPortId)) : null;
  const { predictionData } = usePrediction(selectedPort ? selectedPort.id : null);

  const filtered = useMemo(() => {
    return PORTS.filter((port) => port.name.toLowerCase().includes(search.toLowerCase())).sort(
      (a, b) => (riskData[String(b.id)]?.risk_score ?? 0) - (riskData[String(a.id)]?.risk_score ?? 0)
    );
  }, [riskData, search]);

  const runSimulation = async () => {
    if (!selectedPort) return;
    const store = useAtlasStore.getState();
    store.setIsLoading(true);
    store.setPortStatus(String(selectedPort.id), "analyzing");
    try {
      const result = await simulateDisruption(selectedPort.name, severity);
      store.setSimulationResult(result);
      store.incrementSimulationCount();
    } finally {
      store.setIsLoading(false);
    }
  };

  return (
    <section className="panel-card">
      <div className="panel-heading"><span>SIMULATION CONFIGURATOR</span></div>
      <input className="search" placeholder="Search ports" value={search} onChange={(event) => setSearch(event.target.value)} />
      <div className="port-list atlas-scrollbar">
        {filtered.map((port) => (
          <PortListItem key={port.id} port={port} risk={riskData[String(port.id)]} selected={selectedPortId === String(port.id)} onClick={() => setSelectedPortId(String(port.id))} />
        ))}
      </div>
      <div className="severity">
        <div className="preset-row">
          {[20, 50, 80].map((value) => (
            <button key={value} className={severity === value ? "active" : ""} onClick={() => setSeverity(value)}>
              {value === 20 ? "MINOR" : value === 50 ? "MODERATE" : "CATASTROPHIC"} {value}%
            </button>
          ))}
        </div>
        <input type="range" min="0" max="100" value={severity} onChange={(event) => setSeverity(Number(event.target.value))} />
        <span className="severity-value">{formatPercent(severity)} CAPACITY DROP</span>
      </div>
      <div className="forecast-preview">
        <span>AI PREVIEW</span>
        <strong>{predictionData ? `${Math.round(predictionData.congestion_probability * 100)}% CONGESTION PROBABILITY` : "MODEL READY"}</strong>
        <small>Estimated delay signal: {formatDelayDays((predictionData?.congestion_probability ?? 0.4) * 9)}</small>
      </div>
      <button className={`simulate-button ${isLoading ? "loading" : ""}`} disabled={!selectedPort || isLoading} onClick={runSimulation}>
        {isLoading ? <span className="radar-loader" /> : "SIMULATE DISRUPTION"}
      </button>
    </section>
  );
}
