"use client";

import { useEffect, useState } from "react";

export function useCountUp(target: number, duration: number, delay: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let timeout = 0;
    const start = () => {
      const startAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(target * eased);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    setValue(0);
    timeout = window.setTimeout(start, delay);
    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [target, duration, delay]);

  return value;
}
