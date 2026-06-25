"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { listSimulationHistory } from "@/lib/api";
import { useAtlasStore } from "@/store";
import { ReplayMetrics } from "./ReplayMetrics";
import { SimulationRunList } from "./SimulationRunList";
import { SplitMapComparison } from "./SplitMapComparison";

export function HistoricalReplayDrawer() {
  const open = useAtlasStore((state) => state.isDrawerOpen);
  const lastHistoryFetch = useAtlasStore((state) => state.lastHistoryFetch);
  const setOpen = useAtlasStore((state) => state.setDrawerOpen);

  useEffect(() => {
    if (!open) return;
    const store = useAtlasStore.getState();
    if (store.runList.length > 0 && Date.now() - lastHistoryFetch < 60000) return;
    store.setLoadingHistory(true);
    listSimulationHistory()
      .then(store.setRunList)
      .finally(() => store.setLoadingHistory(false));
  }, [lastHistoryFetch, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="history-drawer" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
          <div className="drawer-handle" />
          <div className="drawer-header">
            <strong>HISTORICAL REPLAY</strong>
            <button onClick={() => setOpen(false)}>CLOSE</button>
          </div>
          <div className="drawer-body">
            <SimulationRunList />
            <div className="replay-pane">
              <ReplayMetrics />
              <SplitMapComparison />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
