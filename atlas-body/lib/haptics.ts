// A whisper of haptic feedback on key taps (mobile only; silently absent elsewhere).
export function tapHaptic(ms = 8): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(ms);
  } catch {
    /* not supported — fine */
  }
}
