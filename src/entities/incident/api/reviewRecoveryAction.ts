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
    const response = await apiClient.post<ReviewRecoveryActionResult>(
      `/recovery-actions/${payload.recoveryActionId}/review`,
      payload,
    );

    return response.data;
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
