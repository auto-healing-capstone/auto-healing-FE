import { apiClient } from "../../../shared/api/client";
import type { CollectionResponse, CollectionResult } from "../../../shared/api/types";
import { normalizeCollectionResponse } from "../../../shared/api/utils";
import type { RecoveryHistoryItem } from "../../dashboard/types";
import {
  type BackendRecoveryAction,
  toRecoveryHistoryItem,
} from "./recoveryActionTransformer";

export async function getIncidentRecoveryActions(
  incidentId: number,
): Promise<CollectionResult<RecoveryHistoryItem>> {
  const response = await apiClient.get<CollectionResponse<BackendRecoveryAction>>(
    `/incidents/${incidentId}/recovery-actions`,
  );
  const result = normalizeCollectionResponse(response.data);
  return {
    items: result.items.map(toRecoveryHistoryItem),
    meta: result.meta,
  };
}
