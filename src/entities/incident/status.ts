import type { IncidentStatus, RecoveryActionStatus } from "./types";

export type IncidentFlowStage =
  | "normal"
  | "warning"
  | "incident"
  | "awaiting_approval"
  | "recovering"
  | "resolved"
  | "failed";

export function getIncidentFlowStage(status: string): IncidentFlowStage {
  switch (status) {
    case "normal":
      return "normal";
    case "warning":
      return "warning";
    case "pending":
      return "awaiting_approval";
    case "approved":
    case "running":
      return "recovering";
    case "resolved":
      return "resolved";
    case "failed":
    case "rejected":
      return "failed";
    case "firing":
    default:
      return "incident";
  }
}

export function getIncidentFlowLabel(status: string) {
  const stage = getIncidentFlowStage(status);

  switch (stage) {
    case "normal":
      return "Normal";
    case "warning":
      return "Warning";
    case "incident":
      return "Incident";
    case "awaiting_approval":
      return "Awaiting Approval";
    case "recovering":
      return "Recovering";
    case "resolved":
      return "Resolved";
    case "failed":
      return "Failed";
  }
}

export function getIncidentFlowChartData(statuses: string[]) {
  const counts: Record<IncidentFlowStage, number> = {
    normal: 0,
    warning: 0,
    incident: 0,
    awaiting_approval: 0,
    recovering: 0,
    resolved: 0,
    failed: 0,
  };

  for (const status of statuses) {
    counts[getIncidentFlowStage(status)] += 1;
  }

  return [
    { key: "normal", label: "Normal", value: counts.normal, color: "#10b981" },
    { key: "warning", label: "Warning", value: counts.warning, color: "#f59e0b" },
    { key: "incident", label: "Incident", value: counts.incident, color: "#ef4444" },
    { key: "awaiting_approval", label: "Awaiting Approval", value: counts.awaiting_approval, color: "#f97316" },
    { key: "recovering", label: "Recovering", value: counts.recovering, color: "#3b82f6" },
    { key: "resolved", label: "Resolved", value: counts.resolved, color: "#14b8a6" },
    { key: "failed", label: "Failed", value: counts.failed, color: "#64748b" },
  ];
}

export function isPendingRecoveryStatus(status: RecoveryActionStatus | IncidentStatus | string) {
  return status === "pending";
}
