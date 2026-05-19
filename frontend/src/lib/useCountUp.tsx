import { useEffect, useState } from "react";

export function useCountUp(target: number, duration = 1200): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

type Format = "decimal" | "integer";

export function CountUp({
  value,
  decimals = 0,
  suffix = "",
  format = "decimal",
  duration,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  format?: Format;
  duration?: number;
}) {
  const v = useCountUp(value, duration);
  const text =
    format === "integer"
      ? Math.round(v).toLocaleString()
      : v.toFixed(decimals);
  return <>{text}{suffix}</>;
}
