"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  duration?: number; // milliseconds
  suffix?: string;
  format?: (n: number) => string;
  className?: string;
};

export default function AnimatedCounter({ value, duration = 1500, suffix = "", format, className = "" }: Props) {
  const [display, setDisplay] = useState<number>(0);
  const rafRef = useRef<number | null>(null);
  const prevRef = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current ?? 0;
    const to = typeof value === "number" ? value : 0;
    if (from === to) {
      setDisplay(to);
      return;
    }

    let start: number | null = null;

    const step = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // simple ease-in-out
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        prevRef.current = to;
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const text = format ? format(display) : display.toLocaleString();

  return (
    <div className={className}>
      {text}
      {suffix}
    </div>
  );
}
