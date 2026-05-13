import { apiClient } from "../../../shared/api/client";
import type { CollectionResponse, CollectionResult } from "../../../shared/api/types";
import { normalizeCollectionResponse } from "../../../shared/api/utils";
import type { RecoveryHistoryItem } from "../types";

interface BackendRecoveryAction {
  id: number;
  incident_id: number | null;
  prediction_id: number | null;
  action_type: string;
  params: Record<string, unknown> | null;
  approval_status: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  executed_at: string | null;
  is_successful: boolean | null;
  log_snippet: string | null;
}

function normalizeActionStatus(action: BackendRecoveryAction): RecoveryHistoryItem["status"] {
  if (action.executed_at) {
    return action.is_successful === false ? "failed" : "resolved";
  }

  switch (action.approval_status) {
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "PENDING":
    default:
      return "pending";
  }
}

function getTarget(params: Record<string, unknown> | null) {
  if (!params) {
    return "target_nginx";
  }

  const target =
    params.container ??
    params.container_name ??
    params.process ??
    params.target ??
    params.service;

  return typeof target === "string" && target.length > 0 ? target : "target_nginx";
}

function mapBackendRecoveryAction(action: BackendRecoveryAction): RecoveryHistoryItem {
  const incidentName = action.incident_id
    ? `Incident #${action.incident_id}`
    : action.prediction_id
      ? `Prediction #${action.prediction_id}`
      : "Unlinked action";
  const completedAt = action.executed_at ?? action.reviewed_at;

  return {
    id: String(action.id),
    incidentName,
    action: action.action_type,
    target: getTarget(action.params),
    status: normalizeActionStatus(action),
    startedAt: action.reviewed_at ?? action.executed_at ?? new Date().toISOString(),
    completedAt,
    summary:
      action.log_snippet ??
      `${action.action_type} is ${action.approval_status.toLowerCase()} for operator review.`,
  };
}

export async function getRecoveryActions(): Promise<CollectionResult<RecoveryHistoryItem>> {
  const response = await apiClient.get<CollectionResponse<BackendRecoveryAction>>("/recovery-actions");
  const result = normalizeCollectionResponse(response.data);

  return {
    ...result,
    items: result.items.map(mapBackendRecoveryAction),
  };
}
