// Display helpers. Storage is always lb/cm; these convert for the UI only.

const LB_PER_KG = 2.2046226218;
const CM_PER_IN = 2.54;

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}
export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}
export function cmToFtIn(cm: number): { ft: number; inch: number } {
  const totalIn = cm / CM_PER_IN;
  const ft = Math.floor(totalIn / 12);
  return { ft, inch: Math.round(totalIn - ft * 12) };
}
export function ftInToCm(ft: number, inch: number): number {
  return (ft * 12 + inch) * CM_PER_IN;
}

/** A weight for display, in the user's units, e.g. "147" (lb) or "67" (kg). */
export function weightDisplay(lb: number, units: "imperial" | "metric"): { value: number; unit: string } {
  return units === "metric"
    ? { value: Math.round(lbToKg(lb)), unit: "kg" }
    : { value: Math.round(lb), unit: "lb" };
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Projection base = the date the snapshot was measured. Keeps the date stable and honest:
 *  you project forward from your last weigh-in, not from whatever the server clock says. */
export function baseFromIso(iso: string): { baseYear: number; baseMonth: number } {
  const d = new Date(iso + "T00:00:00");
  return Number.isNaN(d.getTime())
    ? { baseYear: new Date().getFullYear(), baseMonth: new Date().getMonth() }
    : { baseYear: d.getFullYear(), baseMonth: d.getMonth() };
}
