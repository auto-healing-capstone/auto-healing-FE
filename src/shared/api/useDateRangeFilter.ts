import { useSearchParams } from "react-router";

export type DateRangeFilter =
  | { type: "all" }
  | { type: "preset"; range: "24h" | "7d" | "30d" }
  | { type: "custom"; from: number; to: number };

export function useDateRangeFilter(): DateRangeFilter {
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const range = searchParams.get("range");

  if (from && to) {
    return {
      type: "custom",
      from: new Date(from).getTime(),
      to: new Date(to + "T23:59:59").getTime(),
    };
  }
  if (range === "24h" || range === "7d" || range === "30d") {
    return { type: "preset", range };
  }
  return { type: "all" };
}

export function matchesDateRange(dateStr: string | null | undefined, filter: DateRangeFilter): boolean {
  if (filter.type === "all" || !dateStr) return true;
  const t = new Date(dateStr).getTime();
  if (isNaN(t)) return true;

  if (filter.type === "preset") {
    const ms = { "24h": 24, "7d": 24 * 7, "30d": 24 * 30 }[filter.range] * 3_600_000;
    return t >= Date.now() - ms;
  }
  return t >= filter.from && t <= filter.to;
}
