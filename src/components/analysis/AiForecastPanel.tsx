"use client";

import { motion } from "framer-motion";

import { usePrediction } from "@/hooks/usePrediction";
import { PORT_BY_ID } from "@/lib/portData";
import { useAtlasStore } from "@/store";

export function AiForecastPanel({ portId }: { portId: string }) {
  const { predictionData, isLoading } = usePrediction(Number(portId));
  const port = PORT_BY_ID.get(Number(portId));
  const probability = predictionData?.congestion_probability ?? 0;
  const angle = -90 + probability * 180;

  return (
    <div className="ai-panel">
      <h3>AI CONGESTION FORECAST</h3>
      <p>{port?.name}</p>
      <div className="forecast-gauge">
        <svg viewBox="0 0 220 120">
          <path d="M 20 100 A 90 90 0 0 1 200 100" fill="none" stroke="var(--color-border)" strokeWidth="14" strokeLinecap="round" />
          <path d="M 20 100 A 90 90 0 0 1 200 100" fill="none" stroke="var(--color-accent-cyan)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${probability * 283} 283`} />
          <motion.line
            x1="110"
            y1="100"
            x2="110"
            y2="30"
            stroke="var(--color-critical-red)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            transition={{ duration: 0.8 }}
            style={{ transformOrigin: "110px 100px" }}
          />
          <circle cx="110" cy="100" r="5" fill="var(--color-text-primary)" />
        </svg>
        <strong>{isLoading ? "..." : `${Math.round(probability * 100)}%`}</strong>
      </div>
      <div className="feature-list">
        {Object.entries(predictionData?.top_features ?? {})
          .sort((a, b) => b[1] - a[1])
          .map(([name, value]) => (
            <div key={name} className="importance-row">
              <span>{name.replaceAll("_", " ").toUpperCase()}</span>
              <div><i style={{ width: `${Math.max(8, value * 100)}%` }} /></div>
            </div>
          ))}
      </div>
    </div>
  );
}
