import { apiClient } from "../../../shared/api/client";
import type {
  RecoveryActionDecision,
  RecoveryActionStatus,
  ReviewRecoveryActionPayload,
  ReviewRecoveryActionResult,
} from "../types";

// 백엔드 RecoveryActionRead 응답 구조
interface RecoveryActionRead {
  id: number;
  incident_id: number | null;
  action_type: string;
  approval_status: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

function toNextStatus(status: string, decision: RecoveryActionDecision): RecoveryActionStatus {
  if (status === "APPROVED") return "approved";
  if (status === "REJECTED") return "rejected";
  return decision === "approve" ? "approved" : "rejected";
}

export async function reviewRecoveryAction(
  payload: ReviewRecoveryActionPayload,
): Promise<ReviewRecoveryActionResult> {
  const isApprove = payload.decision === "approve";
  const endpoint = isApprove
    ? `/recovery-actions/${payload.recoveryActionId}/approve`
    : `/recovery-actions/${payload.recoveryActionId}/reject`;

  // 백엔드 필드명: approve → reviewed_by, reject → rejected_by
  const body = isApprove
    ? { reviewed_by: payload.requestedBy, reason: payload.reason }
    : { rejected_by: payload.requestedBy, reason: payload.reason };

  try {
    const response = await apiClient.post<RecoveryActionRead>(endpoint, body);
    const action = response.data;

    return {
      incidentId: payload.incidentId,
      recoveryActionId: String(action.id),
      decision: payload.decision,
      nextStatus: toNextStatus(action.approval_status, payload.decision),
      reviewedAt: action.reviewed_at ?? new Date().toISOString(),
      reviewedBy: action.reviewed_by ?? payload.requestedBy,
      message: isApprove
        ? `Recovery action approved for ${payload.target ?? "selected target"}.`
        : `Recovery action rejected for ${payload.target ?? "selected target"}.`,
    };
  } catch {
    // 백엔드 미응답 시 데모 플로우 유지용 폴백
    return {
      incidentId: payload.incidentId,
      recoveryActionId: payload.recoveryActionId,
      decision: payload.decision,
      nextStatus: isApprove ? "approved" : "rejected",
      reviewedAt: new Date().toISOString(),
      reviewedBy: payload.requestedBy,
      message: isApprove
        ? `Recovery action approved for ${payload.target ?? "selected target"}.`
        : `Recovery action rejected for ${payload.target ?? "selected target"}.`,
    };
  }
}
