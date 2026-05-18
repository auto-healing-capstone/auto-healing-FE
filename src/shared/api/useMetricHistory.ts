import { useEffect, useRef, useState } from "react";
import { getMetricCards } from "../../entities/dashboard/api/getMetricCards";
import type { ChartPoint } from "../../entities/dashboard/types";

const INTERVAL_MS = 10_000;
const MAX_POINTS = 24;

export function useMetricHistory() {
  const [history, setHistory] = useState<ChartPoint[]>([]);
  const [isFallback, setIsFallback] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function tick() {
      try {
        const metrics = await getMetricCards();
        const now = new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const cpu = metrics.find((m) => m.key === "cpu")?.value ?? 0;
        const memory = metrics.find((m) => m.key === "memory")?.value ?? 0;
        // "disk" key holds request_count from the backend
        const disk = metrics.find((m) => m.key === "disk")?.value ?? 0;

        setHistory((prev) => {
          const next = [...prev, { time: now, cpu, memory, disk }];
          return next.slice(-MAX_POINTS);
        });
        setIsFallback(false);
      } catch {
        setIsFallback(true);
      }
    }

    void tick();
    intervalRef.current = setInterval(() => void tick(), INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  return { history, isFallback };
}
