import { riskScoreToHex } from "@/lib/colors";

export function SemiCircularGauge({ value, size = 42 }: { value: number; size?: number }) {
  const radius = size / 2 - 4;
  const circumference = Math.PI * radius;
  const dash = (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
      <path d={`M 4 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 4} ${size / 2}`} fill="none" stroke="var(--color-border)" strokeWidth="4" />
      <path
        d={`M 4 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 4} ${size / 2}`}
        fill="none"
        stroke={riskScoreToHex(value)}
        strokeWidth="4"
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fill="var(--color-text-data)" fontSize="9" fontFamily="var(--font-mono)">
        {Math.round(value)}
      </text>
    </svg>
  );
}
