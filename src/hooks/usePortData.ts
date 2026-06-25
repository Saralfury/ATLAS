"use client";

import { useEffect, useState } from "react";

import { analyzePortRisk } from "@/lib/api";
import { RISK_SCORE_CONCURRENCY_LIMIT, RISK_SCORE_TTL_MS } from "@/lib/animation";
import { PORTS } from "@/lib/portData";
import { useAtlasStore } from "@/store";

export function usePortData() {
  const [isLoading, setIsLoading] = useState(false);
  const riskData = useAtlasStore((state) => state.riskData);
  const setRiskData = useAtlasStore((state) => state.setRiskData);

  useEffect(() => {
    let cancelled = false;
    const stalePorts = PORTS.filter((port) => {
      const risk = riskData[String(port.id)];
      return !risk || Date.now() - risk.timestamp > RISK_SCORE_TTL_MS;
    });
    if (stalePorts.length === 0) return undefined;

    async function load() {
      setIsLoading(true);
      let cursor = 0;
      async function worker() {
        while (!cancelled && cursor < stalePorts.length) {
          const port = stalePorts[cursor++];
          try {
            const result = await analyzePortRisk(port.name);
            setRiskData(String(port.id), result);
          } catch {
            // Individual rows can remain pending if the backend is temporarily unavailable.
          }
        }
      }
      await Promise.all(Array.from({ length: RISK_SCORE_CONCURRENCY_LIMIT }, worker));
      if (!cancelled) setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [riskData, setRiskData]);

  return { isLoading };
}
