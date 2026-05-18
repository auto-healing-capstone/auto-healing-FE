import type { RecoveryHistoryItem } from "../../dashboard/types";
import type { RecoveryActionStatus } from "../types";

export interface BackendRecoveryAction {
  id: string | number;
  // snake_case — incidents/{id}/recovery-actions 개별 액션 응답
  incident_id?: number;
  incident_name?: string;
  action_type?: string;
  target_node?: string;
  started_at?: string;
  completed_at?: string | null;
  description?: string;
  // camelCase — /recovery-actions 피드 응답 (Pydantic이 이미 직렬화)
  incidentName?: string;
  action?: string;
  target?: string;
  status?: string;
  startedAt?: string;
  completedAt?: string | null;
  summary?: string;
}

export function normalizeRecoveryStatus(value?: string): RecoveryActionStatus {
  switch (value?.toUpperCase()) {
    case "APPROVED": return "approved";
    case "RUNNING": return "running";
    case "RESOLVED": return "resolved";
    case "FAILED": return "failed";
    case "REJECTED": return "rejected";
    default: return "pending";
  }
}

export function toRecoveryHistoryItem(item: BackendRecoveryAction): RecoveryHistoryItem {
  return {
    id: String(item.id),
    incidentName: item.incidentName ?? item.incident_name ?? `Incident #${item.incident_id ?? "unknown"}`,
    action: item.action ?? item.action_type ?? "Recovery action",
    target: item.target ?? item.target_node ?? "unknown",
    status: normalizeRecoveryStatus(item.status),
    startedAt: item.startedAt ?? item.started_at ?? new Date().toISOString(),
    completedAt: item.completedAt ?? item.completed_at ?? null,
    summary: item.summary ?? item.description ?? "",
  };
}
