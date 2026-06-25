"use client";

import { motion } from "framer-motion";

export function FeatureBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  return (
    <div className="feature-bar">
      <div className="feature-bar__label">
        <span>{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <div className="feature-bar__track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ delay, duration: 0.6 }}
          className="feature-bar__fill"
        />
      </div>
    </div>
  );
}
