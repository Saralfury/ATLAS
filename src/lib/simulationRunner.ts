import { simulateDisruption } from "@/lib/api";
import { PORT_BY_ID } from "@/lib/portData";
import { useAtlasStore } from "@/store";

let activeSimulationRequest = 0;

export function resetSimulationWorkspace(options: { clearSelection?: boolean } = {}) {
  const store = useAtlasStore.getState();
  store.resetPortStatuses();
  store.setSimulationResult(null);
  store.setCurrentHop(-1);
  store.setIsAnimating(false);
  store.setReplayData(null);
  store.setSelectedReplayId(null);
  store.setLoadingReplay(false);
  if (options.clearSelection) store.setSelectedPortId(null);
}

export async function runSimulationForPort(portId: string) {
  const port = PORT_BY_ID.get(Number(portId));
  if (!port) return;

  const requestId = activeSimulationRequest + 1;
  activeSimulationRequest = requestId;
  const store = useAtlasStore.getState();
  const severity = store.severity;

  resetSimulationWorkspace();
  store.setSelectedPortId(String(port.id));
  store.setIsLoading(true);
  store.setPortStatus(String(port.id), "analyzing");

  try {
    const result = await simulateDisruption(port.name, severity);
    if (activeSimulationRequest !== requestId) return;
    store.setSimulationResult(result);
    store.incrementSimulationCount();
  } finally {
    if (activeSimulationRequest === requestId) {
      useAtlasStore.getState().setIsLoading(false);
    }
  }
}
