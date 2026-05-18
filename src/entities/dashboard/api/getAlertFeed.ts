import { apiClient } from "../../../shared/api/client";
import type { CollectionResponse, CollectionResult } from "../../../shared/api/types";
import { normalizeCollectionResponse } from "../../../shared/api/utils";
import type { AlertFeedItem } from "../types";

interface BackendAlertEvent {
  id: number | string;
  alert_name?: string | null;
  severity?: string | null;
  status?: string | null;
  instance?: string | null;
  summary?: string | null;
  description?: string | null;
  starts_at?: string | null;
  created_at?: string | null;
  incident_id?: number | null;
}

function normalizeSeverity(value?: string | null): AlertFeedItem["severity"] {
  const s = value?.toLowerCase();
  if (s === "critical") return "critical";
  if (s === "high" || s === "warning" || s === "medium") return "warning";
  return "info";
}

function normalizeAlertStatus(value?: string | null): AlertFeedItem["status"] {
  const s = value?.toLowerCase();
  if (s === "resolved" || s === "closed") return "resolved";
  if (s === "acknowledged" || s === "ack") return "acknowledged";
  return "new";
}

function toAlertFeedItem(event: BackendAlertEvent): AlertFeedItem {
  return {
    id: String(event.id),
    title: event.alert_name ?? "Alert",
    message: event.summary ?? event.description ?? "",
    severity: normalizeSeverity(event.severity),
    timestamp: event.starts_at ?? event.created_at ?? new Date().toISOString(),
    source: event.instance ?? undefined,
    target: event.instance ?? undefined,
    status: normalizeAlertStatus(event.status),
  };
}

export async function getAlertFeed(): Promise<CollectionResult<AlertFeedItem>> {
  const response = await apiClient.get<CollectionResponse<BackendAlertEvent>>("/alert-events");
  const result = normalizeCollectionResponse(response.data);
  return {
    items: result.items.map(toAlertFeedItem),
    meta: result.meta,
  };
}
