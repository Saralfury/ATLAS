"use client";

import { AnimatePresence, motion } from "framer-motion";

import { PORT_BY_ID } from "@/lib/portData";
import { formatPercent, formatRiskScore } from "@/lib/formatters";
import { useAtlasStore } from "@/store";

export function PortTooltip() {
  const tooltip = useAtlasStore((state) => state.tooltip);
  const riskData = useAtlasStore((state) => state.riskData);
  const port = tooltip ? PORT_BY_ID.get(Number(tooltip.portId)) : null;
  const risk = tooltip ? riskData[tooltip.portId] : null;
  const maxX = typeof window === "undefined" ? 1000 : window.innerWidth - 250;
  const maxY = typeof window === "undefined" ? 700 : window.innerHeight - 150;

  return (
    <AnimatePresence>
      {tooltip && port ? (
        <motion.div
          className="port-tooltip"
          style={{ left: Math.min(tooltip.x + 14, maxX), top: Math.min(tooltip.y + 14, maxY) }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
        >
          <strong>{port.name}</strong>
          <span>Risk score: {risk ? formatRiskScore(risk.risk_score) : "--"}</span>
          <span>Rank: {risk ? `${risk.criticality_rank} of 30` : "--"}</span>
          <span>Capacity: {formatPercent((port.baseline_load_teu / port.capacity_teu) * 100)}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
