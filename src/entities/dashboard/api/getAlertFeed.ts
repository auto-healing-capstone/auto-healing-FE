import { apiClient } from "../../../shared/api/client";
import type { CollectionResponse, CollectionResult } from "../../../shared/api/types";
import { normalizeCollectionResponse } from "../../../shared/api/utils";
import type { AlertFeedItem } from "../types";

export async function getAlertFeed(): Promise<CollectionResult<AlertFeedItem>> {
  const response = await apiClient.get<CollectionResponse<AlertFeedItem>>("/alerts/feed");
  return normalizeCollectionResponse(response.data);
}
