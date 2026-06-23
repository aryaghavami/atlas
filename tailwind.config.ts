import type { Config } from "tailwindcss";

// Build 001 palette — locked to BIBLE §4: ALL BLACK, GOLD accents, warm-dark (not sterile).
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm-dark blacks — never pure flat #000 everywhere; layered for depth.
        ink: {
          0: "#000000", // true black — page base, the void behind the room
          1: "#0a0a0b", // card base
          2: "#121214", // raised card
          3: "#1a1a1d", // hover / inset
        },
        // Gold — the single accent. Warm, not yellow. Signals value/found-money.
        gold: {
          DEFAULT: "#D4AF37",
          soft: "#E6C966",
          dim: "#9A7F2A",
          glow: "#F2D779",
        },
        // Functional accents, kept muted so gold stays the hero.
        leak: "#E0654B", // warm red-orange for leaks / forgotten subs
        good: "#5CB88A", // muted green for "good" / under control
        line: "#26262a", // hairline borders
        muted: "#7a7a82", // secondary text
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 30px -12px rgba(0,0,0,0.8)",
        glow: "0 0 60px -12px rgba(212,175,55,0.35)",
        "glow-sm": "0 0 24px -8px rgba(212,175,55,0.4)",
      },
      backgroundImage: {
        "gold-grad": "linear-gradient(135deg, #F2D779 0%, #D4AF37 45%, #9A7F2A 100%)",
        "card-sheen":
          "radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 40%)",
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};

export default config;
