"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { PORTS } from "@/lib/portData";
import type { AtlasStore, NetworkAverages } from "@/types/store.types";

const initialStatuses = Object.fromEntries(PORTS.map((port) => [String(port.id), "normal"])) as AtlasStore["portStatuses"];

export const useAtlasStore = create<AtlasStore>()(
  subscribeWithSelector((set) => ({
    portStatuses: initialStatuses,
    selectedPortId: null,
    hoveredPortId: null,
    tooltip: null,
    severity: 80,
    riskData: {},
    networkAverages: null,
    currentResult: null,
    isLoading: false,
    currentHop: -1,
    isAnimating: false,
    simulationCount: 0,
    graphNodes: null,
    graphEdges: null,
    modelLoaded: false,
    isBackendOffline: false,
    runList: [],
    selectedReplayId: null,
    replayData: null,
    lastHistoryFetch: 0,
    isLoadingHistory: false,
    isLoadingReplay: false,
    activeCanvas: "map",
    isDrawerOpen: false,
    isOnboardingVisible: false,
    isShortcutOverlayVisible: false,
    isDemoRunning: false,
    predictionPreview: null,
    setPortStatus: (portId, status) => set((state) => ({ portStatuses: { ...state.portStatuses, [portId]: status } })),
    resetPortStatuses: () => set({ portStatuses: { ...initialStatuses }, currentHop: -1, isAnimating: false }),
    setSelectedPortId: (selectedPortId) => set({ selectedPortId }),
    setHoveredPortId: (hoveredPortId) => set({ hoveredPortId }),
    setTooltip: (tooltip) => set({ tooltip }),
    setSeverity: (severity) => set({ severity }),
    setRiskData: (portId, data) =>
      set((state) => {
        const nextRisk = { ...state.riskData, [portId]: { ...data, timestamp: Date.now() } };
        const values = Object.values(nextRisk);
        const averages: NetworkAverages = {
          betweenness: avg(values.map((item) => item.feature_breakdown.betweenness_norm)),
          capacity: avg(values.map((item) => item.feature_breakdown.capacity_utilization_norm)),
          disruptions: avg(values.map((item) => item.feature_breakdown.historical_disruption_norm)),
          degree: avg(values.map((item) => item.feature_breakdown.degree_norm))
        };
        return { riskData: nextRisk, networkAverages: averages };
      }),
    setNetworkAverages: (networkAverages) => set({ networkAverages }),
    setSimulationResult: (currentResult) => set({ currentResult }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setCurrentHop: (currentHop) => set({ currentHop }),
    setIsAnimating: (isAnimating) => set({ isAnimating }),
    incrementSimulationCount: () => set((state) => ({ simulationCount: state.simulationCount + 1 })),
    setHealth: (graphNodes, graphEdges, modelLoaded) => set({ graphNodes, graphEdges, modelLoaded, isBackendOffline: false }),
    setBackendOffline: (isBackendOffline) => set({ isBackendOffline }),
    setRunList: (runList) => set({ runList, lastHistoryFetch: Date.now() }),
    setReplayData: (replayData) => set({ replayData }),
    setSelectedReplayId: (selectedReplayId) => set({ selectedReplayId }),
    setLoadingHistory: (isLoadingHistory) => set({ isLoadingHistory }),
    setLoadingReplay: (isLoadingReplay) => set({ isLoadingReplay }),
    setActiveCanvas: (activeCanvas) => set({ activeCanvas }),
    setDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
    setOnboardingVisible: (isOnboardingVisible) => set({ isOnboardingVisible }),
    setShortcutOverlayVisible: (isShortcutOverlayVisible) => set({ isShortcutOverlayVisible }),
    setDemoRunning: (isDemoRunning) => set({ isDemoRunning }),
    setPredictionPreview: (predictionPreview) => set({ predictionPreview })
  }))
);

function avg(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export const usePortStatus = (portId: string) => useAtlasStore((state) => state.portStatuses[portId] ?? "normal");
export const useRiskData = (portId: string | null) => useAtlasStore((state) => (portId ? state.riskData[portId] : undefined));
export const useSelectedPortId = () => useAtlasStore((state) => state.selectedPortId);
export const useSimulationResult = () => useAtlasStore((state) => state.currentResult);
export const useIsSimulating = () => useAtlasStore((state) => state.isLoading);
export const useActiveCanvas = () => useAtlasStore((state) => state.activeCanvas);
export const useIsDrawerOpen = () => useAtlasStore((state) => state.isDrawerOpen);
export const useCurrentHop = () => useAtlasStore((state) => state.currentHop);
export const useIsAnimating = () => useAtlasStore((state) => state.isAnimating);
