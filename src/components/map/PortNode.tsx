"use client";

import { memo } from "react";
import { motion } from "framer-motion";

import { statusToHex } from "@/lib/colors";
import { useAtlasStore, usePortStatus } from "@/store";
import type { PortData } from "@/types/port.types";

export const PortNode = memo(function PortNode({
  port,
  x,
  y,
  riskScore
}: {
  port: PortData;
  x: number;
  y: number;
  riskScore: number;
}) {
  const status = usePortStatus(String(port.id));
  const selectedPortId = useAtlasStore((state) => state.selectedPortId);
  const setSelectedPortId = useAtlasStore((state) => state.setSelectedPortId);
  const setTooltip = useAtlasStore((state) => state.setTooltip);
  const pulseDuration = 4 - Math.min(2.5, (riskScore / 100) * 2.5);
  const radius = 8 + Math.min(8, (riskScore / 100) * 8);

  return (
    <g
      className="port-node"
      transform={`translate(${x} ${y})`}
      onMouseMove={(event) => setTooltip({ portId: String(port.id), x: event.clientX, y: event.clientY })}
      onMouseLeave={() => setTooltip(null)}
      onClick={() => setSelectedPortId(String(port.id))}
    >
      <circle r={radius + 8} fill={statusToHex(status)} opacity="0.24" className="pulse-ring" style={{ animationDuration: `${pulseDuration}s` }} />
      {selectedPortId === String(port.id) ? <circle r={radius + 8} fill="none" stroke="var(--color-accent-cyan)" strokeWidth="1.5" /> : null}
      <motion.circle
        r={radius}
        initial={{ fill: statusToHex(status), opacity: 1 }}
        animate={{ fill: statusToHex(status), opacity: status === "analyzing" ? 0.45 : 1 }}
        transition={{ duration: 0.3 }}
      />
      <circle r="3" fill="white" />
    </g>
  );
});
