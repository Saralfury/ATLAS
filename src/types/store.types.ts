import type { FeatureBreakdown, PredictionResult, ReplayResult, RiskAnalysisResult, SimulationResult, SimulationSummary } from "./api.types";
import type { PortStatus } from "./simulation.types";

export interface RiskData extends RiskAnalysisResult {
  timestamp: number;
}

export interface NetworkAverages {
  betweenness: number;
  capacity: number;
  disruptions: number;
  degree: number;
}

export interface AtlasStore {
  portStatuses: Record<string, PortStatus>;
  selectedPortId: string | null;
  hoveredPortId: string | null;
  tooltip: { portId: string; x: number; y: number } | null;
  severity: number;
  riskData: Record<string, RiskData>;
  networkAverages: NetworkAverages | null;
  currentResult: SimulationResult | null;
  isLoading: boolean;
  currentHop: number;
  isAnimating: boolean;
  simulationCount: number;
  graphNodes: number | null;
  graphEdges: number | null;
  modelLoaded: boolean;
  isBackendOffline: boolean;
  runList: SimulationSummary[];
  selectedReplayId: number | null;
  replayData: ReplayResult | null;
  lastHistoryFetch: number;
  isLoadingHistory: boolean;
  isLoadingReplay: boolean;
  activeCanvas: "map" | "network";
  isDrawerOpen: boolean;
  isOnboardingVisible: boolean;
  isShortcutOverlayVisible: boolean;
  isDemoRunning: boolean;
  predictionPreview: PredictionResult | null;
  setPortStatus: (portId: string, status: PortStatus) => void;
  resetPortStatuses: () => void;
  setSelectedPortId: (portId: string | null) => void;
  setHoveredPortId: (portId: string | null) => void;
  setTooltip: (tooltip: { portId: string; x: number; y: number } | null) => void;
  setSeverity: (severity: number) => void;
  setRiskData: (portId: string, data: RiskAnalysisResult) => void;
  setNetworkAverages: (averages: NetworkAverages) => void;
  setSimulationResult: (result: SimulationResult | null) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentHop: (hop: number) => void;
  setIsAnimating: (animating: boolean) => void;
  incrementSimulationCount: () => void;
  setHealth: (nodes: number, edges: number, modelLoaded: boolean) => void;
  setBackendOffline: (offline: boolean) => void;
  setRunList: (runs: SimulationSummary[]) => void;
  setReplayData: (replay: ReplayResult | null) => void;
  setSelectedReplayId: (id: number | null) => void;
  setLoadingHistory: (loading: boolean) => void;
  setLoadingReplay: (loading: boolean) => void;
  setActiveCanvas: (canvas: "map" | "network") => void;
  setDrawerOpen: (open: boolean) => void;
  setOnboardingVisible: (visible: boolean) => void;
  setShortcutOverlayVisible: (visible: boolean) => void;
  setDemoRunning: (running: boolean) => void;
  setPredictionPreview: (prediction: PredictionResult | null) => void;
}

export type { FeatureBreakdown };
