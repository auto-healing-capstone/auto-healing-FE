import { apiClient } from "../../../shared/api/client";
import type { CollectionResponse } from "../../../shared/api/types";
import { normalizeCollectionResponse } from "../../../shared/api/utils";
import type { Incident } from "../types";

export interface BackendIncidentAlert {
  alert_name?: string | null;
  severity?: string | null;
  status?: string | null;
  instance?: string | null;
  summary?: string | null;
  description?: string | null;
  fingerprint?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
}

export interface BackendIncident {
  id: number;
  target_node: string;
  status: string;
  ai_title?: string | null;
  ai_severity?: string | null;
  incident_types: string[];
  trigger_metrics?: {
    alerts?: BackendIncidentAlert[];
  } | null;
  llm_analysis?: {
    analysis?: string | null;
  } | null;
  detected_at: string;
  resolved_at?: string | null;
}

function normalizeSeverity(value?: string | null) {
  const severity = value?.toLowerCase();

  if (severity === "critical") return "critical";
  if (severity === "high" || severity === "medium") return "warning";

  return "info";
}

function normalizeStatus(value: string) {
  switch (value.toUpperCase()) {
    case "PENDING":
      return "pending";
    case "RECOVERING":
      return "running";
    case "RESOLVED":
      return "resolved";
    case "FAILED":
      return "failed";
    case "ANALYZING":
      return "pending";
    case "DETECTED":
    default:
      return "firing";
  }
}

function formatIncidentType(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function toFrontendIncident(incident: BackendIncident): Incident {
  const sourceAlert = incident.trigger_metrics?.alerts?.[0];
  const detectedAt = incident.detected_at;
  const resolvedAt = incident.resolved_at ?? sourceAlert?.ends_at ?? null;
  const title =
    incident.ai_title ??
    sourceAlert?.alert_name ??
    incident.incident_types.map(formatIncidentType).join(", ") ??
    `Incident #${incident.id}`;

  return {
    id: incident.id,
    alert_name: title,
    severity: normalizeSeverity(incident.ai_severity ?? sourceAlert?.severity),
    status: normalizeStatus(incident.status),
    instance: incident.target_node ?? sourceAlert?.instance ?? null,
    summary: incident.ai_title ?? sourceAlert?.summary ?? null,
    description: incident.llm_analysis?.analysis ?? sourceAlert?.description ?? null,
    fingerprint: sourceAlert?.fingerprint ?? null,
    starts_at: sourceAlert?.starts_at ?? detectedAt,
    ends_at: resolvedAt,
    incident_id: incident.id,
    created_at: detectedAt,
    updated_at: resolvedAt,
  };
}

const PAGE_SIZE = 50;

export async function getIncidents() {
  const firstResponse = await apiClient.get<CollectionResponse<BackendIncident>>("/incidents", {
    params: { page: 1, page_size: PAGE_SIZE },
  });
  const firstResult = normalizeCollectionResponse(firstResponse.data);

  if (!firstResult.meta || firstResult.meta.totalPages <= 1) {
    return {
      items: firstResult.items.map(toFrontendIncident),
      meta: firstResult.meta,
    };
  }

  const remainingPages = Array.from(
    { length: firstResult.meta.totalPages - 1 },
    (_, i) => i + 2,
  );

  const rest = await Promise.all(
    remainingPages.map((page) =>
      apiClient
        .get<CollectionResponse<BackendIncident>>("/incidents", {
          params: { page, page_size: PAGE_SIZE },
        })
        .then((r) => normalizeCollectionResponse(r.data).items),
    ),
  );

  return {
    items: [...firstResult.items, ...rest.flat()].map(toFrontendIncident),
    meta: firstResult.meta,
  };
}
