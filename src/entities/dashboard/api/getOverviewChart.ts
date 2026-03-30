import { apiClient } from "../../../shared/api/client";
import type { ChartPoint } from "../types";

export async function getOverviewChart() {
  const response = await apiClient.get<ChartPoint[]>("/metrics/chart");
  return response.data;
}
