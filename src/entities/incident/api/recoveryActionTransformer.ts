import type { RecoveryHistoryItem } from "../../dashboard/types";
import type { RecoveryActionStatus } from "../types";

export interface BackendRecoveryAction {
  id: string | number;
  // snake_case — incidents/{id}/recovery-actions 개별 액션 응답
  incident_id?: number;
  incident_name?: string;
  action_type?: string;
  approval_status?: string;
  executed_at?: string | null;
  is_successful?: boolean | null;
  params?: Record<string, unknown> | null;
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

function normalizeBackendRecoveryActionStatus(item: BackendRecoveryAction): RecoveryActionStatus {
  if (item.status) {
    return normalizeRecoveryStatus(item.status);
  }

  switch (item.approval_status?.toUpperCase()) {
    case "REJECTED":
      return "rejected";
    case "APPROVED":
      if (!item.executed_at) {
        return "approved";
      }
      if (item.is_successful === null || item.is_successful === undefined) {
        return "running";
      }
      return item.is_successful ? "resolved" : "failed";
    case "PENDING":
    default:
      return "pending";
  }
}

export function toRecoveryHistoryItem(item: BackendRecoveryAction): RecoveryHistoryItem {
  const paramsTarget = typeof item.params?.target === "string" ? item.params.target : undefined;

  return {
    id: String(item.id),
    incidentName: item.incidentName ?? item.incident_name ?? `Incident #${item.incident_id ?? "unknown"}`,
    action: item.action ?? item.action_type ?? "Recovery action",
    target: item.target ?? item.target_node ?? paramsTarget ?? "unknown",
    status: normalizeBackendRecoveryActionStatus(item),
    startedAt: item.startedAt ?? item.started_at ?? new Date().toISOString(),
    completedAt: item.completedAt ?? item.completed_at ?? item.executed_at ?? null,
    summary: item.summary ?? item.description ?? "",
  };
}
