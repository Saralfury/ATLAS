"use client";

import { AnimatePresence, motion } from "framer-motion";

import { DamageReport } from "@/components/analysis/DamageReport";
import { PortRiskBreakdown } from "@/components/analysis/PortRiskBreakdown";
import { SimulationConfigurator } from "@/components/analysis/SimulationConfigurator";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAtlasStore } from "@/store";

export function AnalysisPanel() {
  const selectedPortId = useAtlasStore((state) => state.selectedPortId);
  const currentResult = useAtlasStore((state) => state.currentResult);
  const isBackendOffline = useAtlasStore((state) => state.isBackendOffline);
  const showDamage = currentResult !== null;

  return (
    <aside className="analysis-panel">
      {isBackendOffline ? <ErrorState errorType="backend-offline" /> : null}
      <AnimatePresence mode="wait">
        <motion.div key={showDamage ? "damage" : selectedPortId ?? "config"} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>
          {showDamage ? <DamageReport /> : selectedPortId ? <PortRiskBreakdown portId={selectedPortId} /> : <SimulationConfigurator />}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
