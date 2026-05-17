import { apiClient } from "../../../shared/api/client";
import type { CollectionResponse } from "../../../shared/api/types";
import { normalizeCollectionResponse } from "../../../shared/api/utils";
import type { Incident } from "../types";

export async function getIncidents() {
  const response = await apiClient.get<CollectionResponse<Incident>>("/incidents");
  return normalizeCollectionResponse(response.data);
}
