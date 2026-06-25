export function formatTEU(value: number) {
  return `${Math.round(value).toLocaleString("en-IN")} TEU`;
}

export function formatDelayDays(value: number) {
  return `${value.toFixed(1)} days`;
}

export function formatRiskScore(value: number) {
  return value.toFixed(1);
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatRelativeTime(isoString: string) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export function formatEconomicImpact(totalDelayDays: number) {
  return `~$${(totalDelayDays * 0.8).toFixed(1)} BILLION`;
}
