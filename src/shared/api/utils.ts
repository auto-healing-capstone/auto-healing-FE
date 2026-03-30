import { AxiosError } from "axios";
import type { CollectionResponse, CollectionResult, PaginatedResponse } from "./types";

function isPaginatedResponse<T>(value: CollectionResponse<T>): value is PaginatedResponse<T> {
  return typeof value === "object" && value !== null && "items" in value && Array.isArray(value.items);
}

export function normalizeCollectionResponse<T>(value: CollectionResponse<T>): CollectionResult<T> {
  if (isPaginatedResponse(value)) {
    return {
      items: value.items,
      meta: {
        page: value.page,
        pageSize: value.page_size,
        total: value.total,
        totalPages: value.total_pages,
      },
    };
  }

  return {
    items: value,
    meta: null,
  };
}

export function toErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof AxiosError) {
    const message =
      typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : error.message;

    return message || fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
