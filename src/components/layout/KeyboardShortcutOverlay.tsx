"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useAtlasStore } from "@/store";

const rows = [
  ["Esc", "Close overlays"],
  ["?", "Show shortcuts"],
  ["S", "Run simulation"],
  ["1", "Minor severity"],
  ["2", "Moderate severity"],
  ["3", "Catastrophic severity"],
  ["Space", "Pause or resume cascade"]
];

export function KeyboardShortcutOverlay() {
  const visible = useAtlasStore((state) => state.isShortcutOverlayVisible);
  const setVisible = useAtlasStore((state) => state.setShortcutOverlayVisible);
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="shortcut-card">
            <h2>KEYBOARD SHORTCUTS</h2>
            {rows.map(([key, label]) => (
              <div key={key} className="shortcut-row"><kbd>{key}</kbd><span>{label}</span></div>
            ))}
            <button onClick={() => setVisible(false)}>CLOSE</button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
