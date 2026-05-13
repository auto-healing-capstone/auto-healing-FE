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
  try {
    const endpoint =
      payload.decision === "approve"
        ? `/recovery-actions/${payload.recoveryActionId}/approve`
        : `/recovery-actions/${payload.recoveryActionId}/reject`;
    const body =
      payload.decision === "approve"
        ? {
            reviewed_by: payload.requestedBy,
            reason: payload.reason,
          }
        : {
            rejected_by: payload.requestedBy,
            reason: payload.reason,
          };

    const response = await apiClient.post<{
      id: number;
      approval_status: string;
      reviewed_at: string | null;
    }>(endpoint, body);

    const reviewedAt = response.data.reviewed_at ?? new Date().toISOString();

    return {
      incidentId: payload.incidentId,
      recoveryActionId: String(response.data.id),
      decision: payload.decision,
      nextStatus: response.data.approval_status === "APPROVED" ? "approved" : "rejected",
      reviewedAt,
      reviewedBy: payload.requestedBy,
      message:
        payload.decision === "approve"
          ? `Recovery action approved for ${payload.target ?? "selected target"}.`
          : `Recovery action rejected for ${payload.target ?? "selected target"}.`,
    };
  } catch (error) {
    // Keep the current demo flow working until the backend review endpoint is ready.
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
