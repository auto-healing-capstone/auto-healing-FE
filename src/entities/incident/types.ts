export type IncidentSeverity = "critical" | "warning" | "info";

export type IncidentStatus =
  | "normal"
  | "warning"
  | "firing"
  | "pending"
  | "approved"
  | "running"
  | "resolved"
  | "failed"
  | "rejected";

export type RecoveryActionDecision = "approve" | "reject";

export type RecoveryActionStatus =
  | "pending"
  | "approved"
  | "running"
  | "resolved"
  | "failed"
  | "rejected";

export interface Incident {
  id: number;
  alert_name: string;
  severity: IncidentSeverity | string;
  status: IncidentStatus | string;
  instance: string | null;
  summary: string | null;
  description: string | null;
  fingerprint: string | null;
  starts_at: string;
  ends_at: string | null;
  incident_id: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface ReviewRecoveryActionPayload {
  incidentId: number;
  recoveryActionId: string;
  decision: RecoveryActionDecision;
  requestedBy: string;
  reason?: string;
  fingerprint?: string | null;
  target?: string | null;
}

export interface ReviewRecoveryActionResult {
  incidentId: number;
  recoveryActionId: string;
  decision: RecoveryActionDecision;
  nextStatus: RecoveryActionStatus;
  reviewedAt: string;
  reviewedBy: string;
  message: string;
}
