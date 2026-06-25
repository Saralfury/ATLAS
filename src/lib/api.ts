import type { HealthResult, PredictionResult, ReplayResult, RiskAnalysisResult, SimulationResult, SimulationSummary } from "@/types/api.types";

type ApiError = Error & { portNotFound?: boolean; simulationFault?: boolean; modelUnavailable?: boolean; backendOffline?: boolean };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`/api/proxy${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      }
    });
    if (response.ok) return (await response.json()) as T;
    const error = new Error(`API error ${response.status}`) as ApiError;
    if (response.status === 404) error.portNotFound = true;
    if (response.status === 500) error.simulationFault = true;
    if (response.status === 503) error.modelUnavailable = true;
    throw error;
  } catch (cause) {
    if (cause instanceof TypeError) {
      const error = new Error("Backend offline") as ApiError;
      error.backendOffline = true;
      throw error;
    }
    throw cause;
  }
}

export const fetchHealth = () => request<HealthResult>("/health");

export const analyzePortRisk = (portName: string) =>
  request<RiskAnalysisResult>("/risk-analysis", { method: "POST", body: JSON.stringify({ port: portName }) });

export const simulateDisruption = (port: string, capacityDrop: number) =>
  request<SimulationResult>("/simulate", { method: "POST", body: JSON.stringify({ port, capacity_drop: capacityDrop }) });

export const predictCongestion = (portId: number, signal?: AbortSignal) =>
  request<PredictionResult>(`/predict/${portId}`, { signal });

export const listSimulationHistory = (limit = 50) => request<SimulationSummary[]>(`/history/list?limit=${limit}`);

export const replaySimulation = (eventId: number) => request<ReplayResult>(`/history/replay?event_id=${eventId}`);
