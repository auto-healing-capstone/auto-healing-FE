import { apiClient } from "../../../shared/api/client";
import type { MetricItem, MetricTrend } from "../types";

interface BackendMetricValue {
  value?: number;
  change?: string | number;
  trend?: string;
}

// /metrics/current 응답: { cpu: ..., memory: ..., request_count: ... }
// 각 필드가 숫자 또는 { value, change, trend } 객체일 수 있음
interface BackendCurrentMetrics {
  cpu?: BackendMetricValue | number;
  memory?: BackendMetricValue | number;
  request_count?: BackendMetricValue | number;
}

function extractValue(raw: BackendMetricValue | number | undefined): number {
  if (raw === undefined || raw === null) return 0;
  if (typeof raw === "number") return raw;
  return raw.value ?? 0;
}

function extractChange(raw: BackendMetricValue | number | undefined): string {
  if (!raw || typeof raw === "number") return "N/A";
  return String(raw.change ?? "N/A");
}

function extractTrend(raw: BackendMetricValue | number | undefined): MetricTrend {
  if (!raw || typeof raw === "number") return "steady";
  const t = String(raw.trend ?? "").toLowerCase();
  if (t === "up") return "up";
  if (t === "down") return "down";
  return "steady";
}

export async function getMetricCards(): Promise<MetricItem[]> {
  const response = await apiClient.get<BackendCurrentMetrics>("/metrics/current");
  const data = response.data;

  return [
    {
      key: "cpu",
      label: "CPU Usage",
      value: extractValue(data.cpu),
      unit: "%",
      change: extractChange(data.cpu),
      trend: extractTrend(data.cpu),
    },
    {
      key: "memory",
      label: "Memory Usage",
      value: extractValue(data.memory),
      unit: "%",
      change: extractChange(data.memory),
      trend: extractTrend(data.memory),
    },
    {
      key: "disk",
      label: "Request Count",
      value: extractValue(data.request_count),
      unit: "",
      change: extractChange(data.request_count),
      trend: extractTrend(data.request_count),
    },
  ];
}
