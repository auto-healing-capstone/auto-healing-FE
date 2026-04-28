import { useCallback, useEffect, useRef, useState } from "react";
import type { PaginationMeta, RemoteResourceState } from "./types";
import { toErrorMessage } from "./utils";

interface QueryResult<T> {
  data: T;
  meta?: PaginationMeta | null;
}

interface UsePollingResourceOptions<T> {
  cacheKey?: string;
  fallbackData: T;
  fallbackErrorMessage: string;
  intervalMs?: number;
  enabled?: boolean;
  queryFn: () => Promise<QueryResult<T>>;
}

const DEFAULT_INTERVAL_MS = 10000;
const resourceCache = new Map<string, QueryResult<unknown>>();

export function usePollingResource<T>({
  cacheKey,
  fallbackData,
  fallbackErrorMessage,
  intervalMs = DEFAULT_INTERVAL_MS,
  enabled = true,
  queryFn,
}: UsePollingResourceOptions<T>) {
  const cachedResult = cacheKey ? (resourceCache.get(cacheKey) as QueryResult<T> | undefined) : undefined;
  const [state, setState] = useState<RemoteResourceState<T>>({
    data: cachedResult?.data ?? fallbackData,
    meta: cachedResult?.meta ?? null,
    loading: enabled && !cachedResult,
    error: null,
    isFallback: false,
    isEmpty: Array.isArray(cachedResult?.data ?? fallbackData)
      ? (cachedResult?.data ?? fallbackData).length === 0
      : false,
  });
  const queryRef = useRef(queryFn);
  const hasResolvedDataRef = useRef(Boolean(cachedResult));

  useEffect(() => {
    queryRef.current = queryFn;
  }, [queryFn]);

  const refresh = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: !hasResolvedDataRef.current,
      error: null,
    }));

    try {
      const result = await queryRef.current();
      if (cacheKey) {
        resourceCache.set(cacheKey, result);
      }
      hasResolvedDataRef.current = true;
      setState({
        data: result.data,
        meta: result.meta ?? null,
        loading: false,
        error: null,
        isFallback: false,
        isEmpty: Array.isArray(result.data) ? result.data.length === 0 : false,
      });
    } catch (error) {
      const cachedOnError = cacheKey ? (resourceCache.get(cacheKey) as QueryResult<T> | undefined) : undefined;
      hasResolvedDataRef.current = hasResolvedDataRef.current || Boolean(cachedOnError);
      setState({
        data: cachedOnError?.data ?? fallbackData,
        meta: cachedOnError?.meta ?? null,
        loading: false,
        error: toErrorMessage(error, fallbackErrorMessage),
        isFallback: true,
        isEmpty: Array.isArray(cachedOnError?.data ?? fallbackData)
          ? (cachedOnError?.data ?? fallbackData).length === 0
          : false,
      });
    }
  }, [cacheKey, fallbackData, fallbackErrorMessage]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void refresh();

    if (intervalMs <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refresh();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs, refresh]);

  return {
    ...state,
    refresh,
  };
}
