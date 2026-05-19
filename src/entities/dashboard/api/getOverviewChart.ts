import { apiClient } from "../../../shared/api/client";
import type { ChartPoint } from "../types";

interface BackendPrediction {
  id?: number;
  metric_type?: string;
  target_node?: string;
  peak_yhat?: number;
  predicted_at?: string;
  created_at?: string;
}

type BackendPredictionsResponse =
  | BackendPrediction[]
  | { items: BackendPrediction[] };

// 백엔드 metric_type → ChartPoint 필드 매핑
// MEMORY_LEAK은 memory 계열, FD_RATIO는 disk 계열로 취급
const METRIC_FIELD_MAP: Record<string, keyof Omit<ChartPoint, "time">> = {
  CPU: "cpu",
  cpu: "cpu",
  MEMORY: "memory",
  memory: "memory",
  MEMORY_LEAK: "memory",
  DISK: "disk",
  disk: "disk",
  FD_RATIO: "disk",
};

function toChartPoints(predictions: BackendPrediction[]): ChartPoint[] {
  const byTime = new Map<string, ChartPoint>();

  for (const p of predictions) {
    const raw = p.predicted_at ?? p.created_at;
    if (!raw) continue;

    const label = new Date(raw).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const field = p.metric_type ? METRIC_FIELD_MAP[p.metric_type] : undefined;
    if (!field) continue;

    const entry = byTime.get(label) ?? { time: label, cpu: 0, memory: 0, disk: 0 };
    entry[field] = p.peak_yhat ?? 0;
    byTime.set(label, entry);
  }

  return Array.from(byTime.values()).slice(-24);
}

export async function getOverviewChart(): Promise<ChartPoint[]> {
  const response = await apiClient.get<BackendPredictionsResponse>("/predictions?page_size=100");
  const data = response.data;

  const items = Array.isArray(data)
    ? data
    : Array.isArray(data.items)
      ? data.items
      : [];

  return toChartPoints(items);
}
