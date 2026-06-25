import type { PortStatus } from "@/types/simulation.types";

const statusVar: Record<PortStatus, string> = {
  normal: "var(--color-safe-green)",
  at_risk: "var(--color-warning-saffron)",
  congested: "var(--color-critical-red)",
  analyzing: "var(--color-accent-cyan)"
};

const statusHex: Record<PortStatus, string> = {
  normal: "#00C896",
  at_risk: "#FF9500",
  congested: "#FF3B3B",
  analyzing: "#00D4FF"
};

export function statusToColor(status: PortStatus) {
  return statusVar[status] ?? statusVar.normal;
}

export function statusToHex(status: PortStatus) {
  return statusHex[status] ?? statusHex.normal;
}

export function riskScoreToColor(score: number) {
  if (score >= 60) return "var(--color-critical-red)";
  if (score >= 40) return "var(--color-warning-saffron)";
  return "var(--color-safe-green)";
}

export function riskScoreToHex(score: number) {
  if (score >= 60) return "#FF3B3B";
  if (score >= 40) return "#FF9500";
  return "#00C896";
}
