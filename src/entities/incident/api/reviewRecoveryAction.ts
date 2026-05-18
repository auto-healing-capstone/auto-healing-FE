import { apiClient } from "../../../shared/api/client";
import type {
  RecoveryActionDecision,
  ReviewRecoveryActionPayload,
  ReviewRecoveryActionResult,
} from "../types";

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function toNextStatus(decision: RecoveryActionDecision) {
  return decision === "approve" ? "approved" : "rejected";
}

export async function reviewRecoveryAction(
  payload: ReviewRecoveryActionPayload,
): Promise<ReviewRecoveryActionResult> {
  // approve / reject 엔드포인트가 분리되어 있음
  const endpoint =
    payload.decision === "approve"
      ? `/recovery-actions/${payload.recoveryActionId}/approve`
      : `/recovery-actions/${payload.recoveryActionId}/reject`;

  try {
    const response = await apiClient.post<ReviewRecoveryActionResult>(endpoint, {
      reason: payload.reason,
      requested_by: payload.requestedBy,
    });

    return response.data;
  } catch {
    // 백엔드 연결 전까지 데모 플로우 유지
    await delay(450);

    const reviewedAt = new Date().toISOString();
    const nextStatus = toNextStatus(payload.decision);

    return {
      incidentId: payload.incidentId,
      recoveryActionId: payload.recoveryActionId,
      decision: payload.decision,
      nextStatus,
      reviewedAt,
      reviewedBy: payload.requestedBy,
      message:
        payload.decision === "approve"
          ? `Recovery action approved for ${payload.target ?? "selected target"}.`
          : `Recovery action rejected for ${payload.target ?? "selected target"}.`,
    };
  }
}
