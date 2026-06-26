"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { AnalysisPanel } from "@/components/analysis/AnalysisPanel";
import { HistoricalReplayDrawer } from "@/components/drawer/HistoricalReplayDrawer";
import { NetworkGraph } from "@/components/graph/NetworkGraph";
import { IndiaMap } from "@/components/map/IndiaMap";
import { PortTooltip } from "@/components/map/PortTooltip";
import { OnboardingOverlay } from "@/components/overlay/OnboardingOverlay";
import { fetchHealth } from "@/lib/api";
import { runSimulationForPort } from "@/lib/simulationRunner";
import { useAtlasStore } from "@/store";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePortData } from "@/hooks/usePortData";
import { Header } from "./Header";
import { KeyboardShortcutOverlay } from "./KeyboardShortcutOverlay";

export function AppShell() {
  const activeCanvas = useAtlasStore((state) => state.activeCanvas);
  usePortData();

  const runSelectedSimulation = useCallback(async () => {
    const store = useAtlasStore.getState();
    if (store.selectedPortId) await runSimulationForPort(store.selectedPortId);
  }, []);

  useKeyboardShortcuts(runSelectedSimulation);

  useEffect(() => {
    fetchHealth()
      .then((health) => useAtlasStore.getState().setHealth(health.graph_nodes, health.graph_edges, health.model_loaded))
      .catch(() => useAtlasStore.getState().setBackendOffline(true));
  }, []);

  return (
    <>
      <Header />
      <main className="workspace">
        <section className="primary-canvas">
          <AnimatePresence mode="wait">
            <motion.div key={activeCanvas} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="canvas-layer">
              {activeCanvas === "map" ? <IndiaMap /> : <NetworkGraph />}
            </motion.div>
          </AnimatePresence>
        </section>
        <AnalysisPanel />
      </main>
      <PortTooltip />
      <HistoricalReplayDrawer />
      <OnboardingOverlay />
      <KeyboardShortcutOverlay />
    </>
  );
}
