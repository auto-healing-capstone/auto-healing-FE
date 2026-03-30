import { apiClient } from "../../../shared/api/client";
import type { CollectionResponse, CollectionResult } from "../../../shared/api/types";
import { normalizeCollectionResponse } from "../../../shared/api/utils";
import type { RecoveryHistoryItem } from "../types";

export async function getRecoveryActions(): Promise<CollectionResult<RecoveryHistoryItem>> {
  const response = await apiClient.get<CollectionResponse<RecoveryHistoryItem>>("/recovery-actions");
  return normalizeCollectionResponse(response.data);
}
