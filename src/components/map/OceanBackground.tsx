export function OceanBackground() {
  return (
    <svg className="ocean-bg" aria-hidden="true">
      <defs>
        <radialGradient id="atlas-ocean" cx="0.42" cy="0.38" r="0.95">
          <animate
            attributeName="cx"
            values="0.42;0.56;0.42"
            dur="20s"
            repeatCount="indefinite"
          />
          <stop offset="0%" stopColor="#081423" />
          <stop offset="45%" stopColor="#040C18" />
          <stop offset="100%" stopColor="#01050B" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#atlas-ocean)" />
    </svg>
  );
}