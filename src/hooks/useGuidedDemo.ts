"use client";

import { useCallback } from "react";

import { useAtlasStore } from "@/store";

export function useGuidedDemo() {
  const setDemoRunning = useAtlasStore((state) => state.setDemoRunning);
  const setSelectedPortId = useAtlasStore((state) => state.setSelectedPortId);
  const setSeverity = useAtlasStore((state) => state.setSeverity);
  const setDrawerOpen = useAtlasStore((state) => state.setDrawerOpen);
  const isDemoRunning = useAtlasStore((state) => state.isDemoRunning);

  const startDemo = useCallback(() => {
    setDemoRunning(true);
    setSelectedPortId("1");
    setSeverity(80);
    window.setTimeout(() => setDrawerOpen(true), 6000);
    window.setTimeout(() => setDemoRunning(false), 30000);
  }, [setDemoRunning, setDrawerOpen, setSelectedPortId, setSeverity]);

  return { startDemo, isDemoRunning };
}
