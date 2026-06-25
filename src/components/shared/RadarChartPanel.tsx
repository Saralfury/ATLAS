"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

import { FeatureBar } from "@/components/shared/FeatureBar";
import { FEATURE_BAR_STAGGER_DELAY_S } from "@/lib/animation";
import { useAtlasStore } from "@/store";

export function RadarChartPanel({ portId }: { portId: string }) {
  const risk = useAtlasStore((state) => state.riskData[portId]);
  const averages = useAtlasStore((state) => state.networkAverages);
  if (!risk) return null;
  const rows = [
    { axis: "BETWEENNESS", port: risk.feature_breakdown.betweenness_norm, network: averages?.betweenness ?? 50 },
    { axis: "CAPACITY", port: risk.feature_breakdown.capacity_utilization_norm, network: averages?.capacity ?? 50 },
    { axis: "DISRUPTIONS", port: risk.feature_breakdown.historical_disruption_norm, network: averages?.disruptions ?? 50 },
    { axis: "DEGREE", port: risk.feature_breakdown.degree_norm, network: averages?.degree ?? 50 }
  ];
  return (
    <div>
      <div className="radar-wrap">
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={rows}>
            <PolarGrid stroke="var(--color-border)" gridType="polygon" />
            <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }} />
            <Radar dataKey="network" stroke="#1E3A5F" fill="#1E3A5F" fillOpacity={0.2} />
            <Radar dataKey="port" stroke="var(--color-accent-cyan)" fill="var(--color-accent-cyan)" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {rows.map((row, index) => (
        <FeatureBar key={row.axis} label={row.axis} value={row.port} delay={index * FEATURE_BAR_STAGGER_DELAY_S} />
      ))}
    </div>
  );
}
