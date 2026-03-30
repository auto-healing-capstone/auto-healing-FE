import { apiClient } from "../../../shared/api/client";
import type { MetricItem } from "../types";

export async function getMetricCards() {
  const response = await apiClient.get<MetricItem[]>("/metrics/cards");
  return response.data;
}
