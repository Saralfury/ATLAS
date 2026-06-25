"use client";

import { SemiCircularGauge } from "@/components/shared/SemiCircularGauge";
import { riskScoreToColor } from "@/lib/colors";
import type { PortData } from "@/types/port.types";
import type { RiskData } from "@/types/store.types";

export function PortListItem({ port, risk, selected, onClick }: { port: PortData; risk?: RiskData; selected: boolean; onClick: () => void }) {
  const score = risk?.risk_score ?? 0;
  return (
    <button className={`port-row ${selected ? "selected" : ""}`} onClick={onClick}>
      <SemiCircularGauge value={score} size={38} />
      <span className="port-row__name">{port.name}</span>
      <span className="port-row__score font-tabular" style={{ color: riskScoreToColor(score) }}>
        {risk ? score.toFixed(1) : "--"}
      </span>
    </button>
  );
}
