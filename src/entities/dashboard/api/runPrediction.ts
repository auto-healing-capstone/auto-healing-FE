import { apiClient } from "../../../shared/api/client";

export async function runPrediction(): Promise<{ status: string; message: string }> {
  const response = await apiClient.post<{ status: string; message: string }>("/predictions/run");
  return response.data;
}
