import { describe, expect, it } from "vitest";
import { navyBodyFat } from "./bodyfat";

describe("navyBodyFat", () => {
  it("estimates a believable male body fat", () => {
    const pct = navyBodyFat({ sex: "male", heightCm: 178, neckCm: 38, waistCm: 86 });
    expect(pct).toBeGreaterThan(10);
    expect(pct).toBeLessThan(28);
  });

  it("estimates a believable female body fat", () => {
    const pct = navyBodyFat({ sex: "female", heightCm: 165, neckCm: 32, waistCm: 74, hipCm: 100 });
    expect(pct).toBeGreaterThan(18);
    expect(pct).toBeLessThan(38);
  });

  it("rises with waist circumference", () => {
    const lean = navyBodyFat({ sex: "male", heightCm: 178, neckCm: 38, waistCm: 80 });
    const heavier = navyBodyFat({ sex: "male", heightCm: 178, neckCm: 38, waistCm: 95 });
    expect(heavier).toBeGreaterThan(lean);
  });

  it("clamps to a sane range", () => {
    const pct = navyBodyFat({ sex: "male", heightCm: 178, neckCm: 50, waistCm: 51 });
    expect(pct).toBeGreaterThanOrEqual(3);
    expect(pct).toBeLessThanOrEqual(60);
  });
});
