import { apiClient } from "../../../shared/api/client";
import type { CollectionResponse, CollectionResult } from "../../../shared/api/types";
import { normalizeCollectionResponse } from "../../../shared/api/utils";
import type { RecoveryHistoryItem } from "../types";
import {
  type BackendRecoveryAction,
  toRecoveryHistoryItem,
} from "../../incident/api/recoveryActionTransformer";

export async function getRecoveryActions(): Promise<CollectionResult<RecoveryHistoryItem>> {
  const response = await apiClient.get<CollectionResponse<BackendRecoveryAction>>("/recovery-actions");
  const result = normalizeCollectionResponse(response.data);
  return {
    items: result.items.map(toRecoveryHistoryItem),
    meta: result.meta,
  };
}
