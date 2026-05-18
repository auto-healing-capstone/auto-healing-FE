import { apiClient } from "../../../shared/api/client";
import type { Incident } from "../types";
import { type BackendIncident, toFrontendIncident } from "./getIncidents";

export async function getIncidentById(id: number): Promise<Incident> {
  const response = await apiClient.get<BackendIncident>(`/incidents/${id}`);
  return toFrontendIncident(response.data);
}
