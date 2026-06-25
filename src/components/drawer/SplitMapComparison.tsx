"use client";

import { useMemo, useRef } from "react";

import { IndiaMap } from "@/components/map/IndiaMap";
import { PORTS } from "@/lib/portData";
import { useAtlasStore } from "@/store";
import type { PortStatus } from "@/types/simulation.types";

export function SplitMapComparison() {
  const replay = useAtlasStore((state) => state.replayData);
  const beforeRef = useRef<HTMLDivElement | null>(null);
  const afterRef = useRef<HTMLDivElement | null>(null);
  const dividerRef = useRef<HTMLDivElement | null>(null);

  const beforeStatuses = useMemo(() => Object.fromEntries(PORTS.map((port) => [String(port.id), "normal"])) as Record<string, PortStatus>, []);
  const afterStatuses = useMemo(() => {
    const base = { ...beforeStatuses };
    replay?.after_state.node_states.forEach((node) => {
      base[String(node.port_id)] = node.status as PortStatus;
    });
    return base;
  }, [beforeStatuses, replay]);

  const startDrag = () => {
    const move = (event: MouseEvent) => {
      const rect = dividerRef.current?.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const pct = Math.max(10, Math.min(90, ((event.clientX - rect.left) / rect.width) * 100));
      if (beforeRef.current) beforeRef.current.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      if (afterRef.current) afterRef.current.style.clipPath = `inset(0 0 0 ${pct}%)`;
      if (dividerRef.current) dividerRef.current.style.left = `${pct}%`;
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div className="split-map">
      <div ref={beforeRef} className="split-layer before"><IndiaMap overrideStatuses={beforeStatuses} /></div>
      <div ref={afterRef} className="split-layer after"><IndiaMap overrideStatuses={afterStatuses} /></div>
      <div ref={dividerRef} className="split-divider" onMouseDown={startDrag}><i /></div>
    </div>
  );
}
