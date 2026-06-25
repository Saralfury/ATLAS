export function OceanBackground() {
  return (
    <svg className="ocean-bg" aria-hidden="true">
      <defs>
        <radialGradient id="atlas-ocean" cx="0.4" cy="0.4" r="0.8">
          <animate attributeName="cx" values="0.4;0.6;0.4" dur="15s" repeatCount="indefinite" />
          <stop offset="0%" stopColor="#0F2744" />
          <stop offset="55%" stopColor="#071828" />
          <stop offset="100%" stopColor="#030E1A" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#atlas-ocean)" />
    </svg>
  );
}
