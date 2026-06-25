"use client";

import { useEffect } from "react";

import { useAtlasStore } from "@/store";

export function useKeyboardShortcuts(onSimulate?: () => void) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      const store = useAtlasStore.getState();
      if (event.key === "Escape") {
        store.setTooltip(null);
        store.setShortcutOverlayVisible(false);
        store.setDrawerOpen(false);
      }
      if (event.key === "?") store.setShortcutOverlayVisible(!store.isShortcutOverlayVisible);
      if (event.key.toLowerCase() === "s" && store.selectedPortId && !store.isLoading) onSimulate?.();
      if (event.key === "1") store.setSeverity(20);
      if (event.key === "2") store.setSeverity(50);
      if (event.key === "3") store.setSeverity(80);
      if (event.key === " ") {
        event.preventDefault();
        store.setIsAnimating(!store.isAnimating);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSimulate]);
}
