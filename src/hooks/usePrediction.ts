"use client";

import { useEffect, useState } from "react";

import { predictCongestion } from "@/lib/api";
import type { PredictionResult } from "@/types/api.types";

export function usePrediction(portId: number | null) {
  const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (portId === null) {
      setPredictionData(null);
      return undefined;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setIsLoading(true);
      predictCongestion(portId, controller.signal)
        .then(setPredictionData)
        .catch(() => setPredictionData(null))
        .finally(() => setIsLoading(false));
    }, 300);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [portId]);

  return { predictionData, isLoading };
}
