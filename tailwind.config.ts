import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "ocean-deep": "var(--color-ocean-deep)",
        "ocean-mid": "var(--color-ocean-mid)",
        "ocean-surface": "var(--color-ocean-surface)",
        "border-color": "var(--color-border)",
        "border-active": "var(--color-border-active)",
        "accent-cyan": "var(--color-accent-cyan)",
        "warning-saffron": "var(--color-warning-saffron)",
        "critical-red": "var(--color-critical-red)",
        "safe-green": "var(--color-safe-green)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-tertiary": "var(--color-text-tertiary)",
        "text-data": "var(--color-text-data)"
      },
      fontFamily: {
        display: ["var(--font-space)", "Space Grotesk", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
