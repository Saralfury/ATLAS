"use client";

import { useCallback, useEffect, useRef } from "react";

import { CASCADE_HOP_DELAY_MS } from "@/lib/animation";
import { useAtlasStore } from "@/store";
import type { SimulationResult } from "@/types/api.types";
import type { PortStatus } from "@/types/simulation.types";

export function useCascadeAnimation(onPortStateChange: (portId: string, status: PortStatus) => void) {
  const timeouts = useRef<number[]>([]);
  const setCurrentHop = useAtlasStore((state) => state.setCurrentHop);
  const setIsAnimating = useAtlasStore((state) => state.setIsAnimating);
  const currentHop = useAtlasStore((state) => state.currentHop);
  const isAnimating = useAtlasStore((state) => state.isAnimating);

  const resetAnimation = useCallback(() => {
    timeouts.current.forEach((timeout) => window.clearTimeout(timeout));
    timeouts.current = [];
    setCurrentHop(-1);
    setIsAnimating(false);
  }, [setCurrentHop, setIsAnimating]);

  const startAnimation = useCallback(
    (result: SimulationResult) => {
      resetAnimation();
      const byHop = new Map<number, typeof result.state_transitions>();
      result.state_transitions.forEach((transition) => {
        byHop.set(transition.hop, [...(byHop.get(transition.hop) ?? []), transition]);
      });
      setIsAnimating(true);
      const hops = [...byHop.keys()].sort((a, b) => a - b);
      hops.forEach((hop, index) => {
        const timeout = window.setTimeout(() => {
          setCurrentHop(hop);
          byHop.get(hop)?.forEach((transition) => onPortStateChange(String(transition.port_id), transition.transition as PortStatus));
          if (index === hops.length - 1) {
            window.setTimeout(() => setIsAnimating(false), CASCADE_HOP_DELAY_MS);
          }
        }, hop * CASCADE_HOP_DELAY_MS);
        timeouts.current.push(timeout);
      });
    },
    [onPortStateChange, resetAnimation, setCurrentHop, setIsAnimating]
  );

  useEffect(() => resetAnimation, [resetAnimation]);

  return { startAnimation, resetAnimation, isAnimating, currentHop };
}
