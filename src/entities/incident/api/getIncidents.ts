import { apiClient } from "../../../shared/api/client";
import type { Incident } from "../types";

export async function getIncidents() {
  const response = await apiClient.get<Incident[]>("/incidents");
  return response.data;
}
