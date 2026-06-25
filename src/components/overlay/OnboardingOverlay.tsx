"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useAtlasStore } from "@/store";

export function OnboardingOverlay() {
  const visible = useAtlasStore((state) => state.isOnboardingVisible);
  const setVisible = useAtlasStore((state) => state.setOnboardingVisible);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("atlas_onboarded") === null) {
      setVisible(true);
    }
  }, [setVisible]);

  const dismiss = () => {
    localStorage.setItem("atlas_onboarded", "true");
    setVisible(false);
    useAtlasStore.getState().setSelectedPortId("1");
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="onboarding-card">
            <h1>ATLAS</h1>
            <p>Monitor risk, simulate a port shock, and replay the cascade across India's maritime network.</p>
            <div className="onboarding-steps">
              <span>1 SELECT A PORT</span>
              <span>2 RUN A DISRUPTION</span>
              <span>3 REVIEW CASCADE DAMAGE</span>
            </div>
            <button onClick={dismiss}>BEGIN</button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
