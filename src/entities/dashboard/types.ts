import type { Incident, RecoveryActionStatus } from "../incident/types";

export type MetricTrend = "up" | "down" | "steady";

export interface MetricItem {
  key: "cpu" | "memory" | "disk";
  label: string;
  value: number;
  unit: string;
  change: string;
  trend: MetricTrend;
}

export interface ChartPoint {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
}

export interface DashboardState {
  incidents: Incident[];
  metrics: MetricItem[];
  chartData: ChartPoint[];
  loading: boolean;
  error: string | null;
}

export interface AlertFeedItem {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
  source?: string;
  target?: string;
  status?: "new" | "acknowledged" | "resolved";
}

export interface RecoveryHistoryItem {
  id: string;
  incidentName: string;
  action: string;
  target: string;
  status: RecoveryActionStatus;
  startedAt: string;
  completedAt: string | null;
  summary: string;
}
