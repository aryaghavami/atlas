"use client";
import { useEffect, useRef, useState } from "react";

// Count-up that eases to its target and re-animates when the value changes. Tabular figures keep
// the layout rock-steady mid-count. Honors reduced-motion (snaps straight to the value).

export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 900,
  className,
  style,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    const from = fromRef.current;
    const delta = value - from;
    if (delta === 0) return;
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // cubic ease-out

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(from + delta * ease(t));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
  }, [value, duration]);

  return (
    <span className={`tnum ${className ?? ""}`} style={style}>
      {display.toFixed(decimals)}
    </span>
  );
}
