import type { Config } from "tailwindcss";

// Atlas · Body palette — ported from the design (Atlas Body.dc.html). Warm-dark black,
// gold accent, sage green for the protected number (lean mass). Gold stays the hero.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          0: "#050506", // device shell / true black
          1: "#08080a", // screen base
          2: "#101013", // raised
        },
        gold: {
          DEFAULT: "#b9952f", // eyebrow / accents
          soft: "#D9B27C", // amber caption / "at risk"
          dim: "#A8824E",
        },
        sage: {
          DEFAULT: "#A8C3A6", // lean mass "holding"
          dim: "#7E9579",
        },
        bone: "#EFEBE3", // primary text
        ash: "#b8b3a8", // secondary serif
        muted: "#908C83", // labels
        faint: "#6E6A63", // tertiary
        line: "rgba(239,235,227,0.1)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
