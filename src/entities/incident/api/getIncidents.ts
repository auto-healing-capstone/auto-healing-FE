import { apiClient } from "../../../shared/api/client";
import type { CollectionResponse } from "../../../shared/api/types";
import { normalizeCollectionResponse } from "../../../shared/api/utils";
import type { Incident } from "../types";

interface BackendIncident {
  id: number;
  target_node: string;
  status: string;
  ai_title: string | null;
  ai_severity: string | null;
  incident_types: string[];
  trigger_metrics: {
    alerts?: Array<{
      alert_name?: string;
      severity?: string;
      status?: string;
      instance?: string | null;
      summary?: string | null;
      description?: string | null;
      fingerprint?: string | null;
      starts_at?: string;
      ends_at?: string | null;
    }>;
  } | null;
  llm_analysis: { analysis?: string } | null;
  detected_at: string;
  resolved_at: string | null;
}

function normalizeSeverity(value: string | null | undefined) {
  return (value ?? "info").toLowerCase();
}

function normalizeStatus(value: string | null | undefined) {
  return (value ?? "firing").toLowerCase();
}

function mapBackendIncident(incident: BackendIncident): Incident {
  const firstAlert = incident.trigger_metrics?.alerts?.[0];
  const title =
    incident.ai_title ??
    firstAlert?.alert_name ??
    `Incident #${incident.id}`;
  const incidentTypes = incident.incident_types?.join(", ") || "Unknown";

  return {
    id: incident.id,
    alert_name: title,
    severity: normalizeSeverity(incident.ai_severity ?? firstAlert?.severity),
    status: normalizeStatus(incident.status),
    instance: incident.target_node ?? firstAlert?.instance ?? null,
    summary: firstAlert?.summary ?? `Incident types: ${incidentTypes}`,
    description:
      incident.llm_analysis?.analysis ??
      firstAlert?.description ??
      `Detected incident types: ${incidentTypes}`,
    fingerprint: firstAlert?.fingerprint ?? `incident-${incident.id}`,
    starts_at: firstAlert?.starts_at ?? incident.detected_at,
    ends_at: firstAlert?.ends_at ?? incident.resolved_at,
    incident_id: incident.id,
    created_at: incident.detected_at,
    updated_at: incident.resolved_at,
  };
}

export async function getIncidents() {
  const response = await apiClient.get<CollectionResponse<BackendIncident>>("/incidents");
  const result = normalizeCollectionResponse(response.data);

  return {
    ...result,
    items: result.items.map(mapBackendIncident),
  };
}
