"use client";

import { useEffect, useState } from "react";

import { GLITCH_DURATION_MS, GLITCH_INTERVAL_MS } from "@/lib/animation";
import { useGuidedDemo } from "@/hooks/useGuidedDemo";
import { useAtlasStore } from "@/store";

export function Header() {
  const [glitch, setGlitch] = useState(false);
  const { startDemo } = useGuidedDemo();
  const simulationCount = useAtlasStore((state) => state.simulationCount);
  const graphNodes = useAtlasStore((state) => state.graphNodes);
  const graphEdges = useAtlasStore((state) => state.graphEdges);
  const modelLoaded = useAtlasStore((state) => state.modelLoaded);
  const activeCanvas = useAtlasStore((state) => state.activeCanvas);
  const setActiveCanvas = useAtlasStore((state) => state.setActiveCanvas);
  const setDrawerOpen = useAtlasStore((state) => state.setDrawerOpen);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setGlitch(true);
      window.setTimeout(() => setGlitch(false), GLITCH_DURATION_MS);
    }, GLITCH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className={`brand ${glitch ? "glitching" : ""}`}>ATLAS</div>
      <div className="divider" />
      <div className="subtitle">INDIAN PORT RISK COMMAND</div>
      <div className="header-spacer" />
      <div className="system-pill"><i /> SYSTEM {modelLoaded ? "ONLINE" : "DEGRADED"}</div>
      <div className="meta">{graphNodes ?? "--"} PORTS MONITORED | {graphEdges ?? "--"} ROUTES TRACKED</div>
      <div className="meta">SIMS {simulationCount}</div>
      <div className="toggle">
        <button className={activeCanvas === "map" ? "active" : ""} onClick={() => setActiveCanvas("map")}>MAP VIEW</button>
        <button className={activeCanvas === "network" ? "active" : ""} onClick={() => setActiveCanvas("network")}>NETWORK VIEW</button>
      </div>
      <button className="ghost-button" onClick={() => setDrawerOpen(true)}>HISTORICAL REPLAY</button>
      <button className="primary-button" onClick={startDemo}>GUIDED DEMO</button>
    </header>
  );
}
