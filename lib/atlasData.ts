import { computeAtlas, type EngineInput } from "./engine";
import { monteCarloBands } from "./engineBands";

// Representative sample for the public demo (all fictional).
export const representative: EngineInput = {
  accounts: [
    { name: "Chase", balance: 14200, tier: "liquid" },
    { name: "Charles Schwab", balance: 223400, tier: "near" },
    { name: "Vanguard 401(k)", balance: 104580, tier: "illiquid" },
  ],
  liabilities: [],
  monthlyIncome: 14800,
  monthlyBurn: 7300,
  target: 1000000,
};

// A second fictional persona for the reveal screen.
export const sampleReal: EngineInput = {
  accounts: [
    { name: "Checking", balance: 9500, tier: "liquid" },
    { name: "Brokerage", balance: 38000, tier: "near" },
    { name: "Crypto", balance: 6000, tier: "volatile" },
  ],
  liabilities: [
    { name: "Car loan", balance: 14000, apr: 0.06, minPayment: 320 },
    { name: "Credit card", balance: 3200, apr: 0.22, minPayment: 120 },
  ],
  monthlyIncome: 9000,
  monthlyBurn: 5200,
  target: 1000000,
};

export const representativeOut = computeAtlas(representative);
export const sampleOut = computeAtlas(sampleReal);
export const representativeBands = monteCarloBands(representative);
export const sampleBands = monteCarloBands(sampleReal);
