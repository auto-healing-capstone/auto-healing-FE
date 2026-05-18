import { apiClient } from "../../../shared/api/client";
import type { ChartPoint } from "../types";

// /predictions 응답 항목 — metric_type별로 여러 레코드가 옴
interface BackendPrediction {
  id?: number;
  metric_type?: string;    // "cpu" | "memory" | "request_count"
  target_node?: string;
  predicted_value?: number;
  predicted_at?: string;
  created_at?: string;
}

type BackendPredictionsResponse =
  | BackendPrediction[]
  | { items: BackendPrediction[] };

function toChartPoints(predictions: BackendPrediction[]): ChartPoint[] {
  const byTime = new Map<string, { time: string; cpu: number; memory: number; disk: number }>();

  for (const p of predictions) {
    const raw = p.predicted_at ?? p.created_at;
    if (!raw) continue;

    const label = new Date(raw).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const entry = byTime.get(label) ?? { time: label, cpu: 0, memory: 0, disk: 0 };
    const value = p.predicted_value ?? 0;

    if (p.metric_type === "cpu") entry.cpu = value;
    else if (p.metric_type === "memory") entry.memory = value;

    byTime.set(label, entry);
  }

  // 시간 순 정렬 후 최근 24개 포인트만 반환
  return Array.from(byTime.values()).slice(-24);
}

export async function getOverviewChart(): Promise<ChartPoint[]> {
  const response = await apiClient.get<BackendPredictionsResponse>("/predictions");
  const data = response.data;

  const items = Array.isArray(data)
    ? data
    : Array.isArray(data.items)
      ? data.items
      : [];

  return toChartPoints(items);
}
