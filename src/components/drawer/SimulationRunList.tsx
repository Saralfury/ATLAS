"use client";

import { formatRelativeTime } from "@/lib/formatters";
import { replaySimulation } from "@/lib/api";
import { useAtlasStore } from "@/store";

export function SimulationRunList() {
  const runs = useAtlasStore((state) => state.runList);
  const selectedReplayId = useAtlasStore((state) => state.selectedReplayId);

  const selectRun = async (id: number) => {
    const store = useAtlasStore.getState();
    store.setSelectedReplayId(id);
    store.setLoadingReplay(true);
    try {
      store.setReplayData(await replaySimulation(id));
    } finally {
      store.setLoadingReplay(false);
    }
  };

  return (
    <div className="run-list atlas-scrollbar">
      {runs.map((run) => (
        <button key={run.id} className={selectedReplayId === run.id ? "active" : ""} onClick={() => selectRun(run.id)}>
          <strong>#{run.id} {run.port}</strong>
          <span>{run.capacity_drop}% DROP | CASCADE {run.cascade_size}</span>
          <small>{formatRelativeTime(run.created_at)}</small>
        </button>
      ))}
      {runs.length === 0 ? <span className="empty-note">No persisted simulations yet.</span> : null}
    </div>
  );
}
