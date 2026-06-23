import { describe, expect, it } from "vitest";
import { parseLatestMeasure } from "./withings";

describe("parseLatestMeasure", () => {
  it("converts the most recent group to lb + %", () => {
    const json = {
      status: 0,
      body: {
        measuregrps: [
          { date: 1_700_000_000, measures: [{ value: 82000, type: 1, unit: -3 }, { value: 184, type: 6, unit: -1 }] }, // 82.0 kg, 18.4%
          { date: 1_600_000_000, measures: [{ value: 85000, type: 1, unit: -3 }] }, // older
        ],
      },
    };
    const w = parseLatestMeasure(json);
    expect(w).not.toBeNull();
    expect(w!.weightLb).toBeCloseTo(180.8, 1); // 82 kg → ~180.8 lb
    expect(w!.bodyFatPct).toBe(18.4);
    expect(w!.source).toBe("withings");
  });

  it("returns null when there are no groups", () => {
    expect(parseLatestMeasure({ status: 0, body: { measuregrps: [] } })).toBeNull();
  });

  it("defaults body fat when the scale only reported weight", () => {
    const w = parseLatestMeasure({ status: 0, body: { measuregrps: [{ date: 1, measures: [{ value: 90000, type: 1, unit: -3 }] }] } });
    expect(w!.bodyFatPct).toBe(20);
  });
});
