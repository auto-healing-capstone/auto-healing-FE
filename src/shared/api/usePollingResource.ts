import { useCallback, useEffect, useRef, useState } from "react";
import type { PaginationMeta, RemoteResourceState } from "./types";
import { toErrorMessage } from "./utils";

interface QueryResult<T> {
  data: T;
  meta?: PaginationMeta | null;
}

interface UsePollingResourceOptions<T> {
  fallbackData: T;
  fallbackErrorMessage: string;
  intervalMs?: number;
  enabled?: boolean;
  queryFn: () => Promise<QueryResult<T>>;
}

const DEFAULT_INTERVAL_MS = 10000;

export function usePollingResource<T>({
  fallbackData,
  fallbackErrorMessage,
  intervalMs = DEFAULT_INTERVAL_MS,
  enabled = true,
  queryFn,
}: UsePollingResourceOptions<T>) {
  const [state, setState] = useState<RemoteResourceState<T>>({
    data: fallbackData,
    meta: null,
    loading: enabled,
    error: null,
    isFallback: false,
    isEmpty: Array.isArray(fallbackData) ? fallbackData.length === 0 : false,
  });
  const queryRef = useRef(queryFn);

  useEffect(() => {
    queryRef.current = queryFn;
  }, [queryFn]);

  const refresh = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    try {
      const result = await queryRef.current();
      setState({
        data: result.data,
        meta: result.meta ?? null,
        loading: false,
        error: null,
        isFallback: false,
        isEmpty: Array.isArray(result.data) ? result.data.length === 0 : false,
      });
    } catch (error) {
      setState({
        data: fallbackData,
        meta: null,
        loading: false,
        error: toErrorMessage(error, fallbackErrorMessage),
        isFallback: true,
        isEmpty: Array.isArray(fallbackData) ? fallbackData.length === 0 : false,
      });
    }
  }, [fallbackData, fallbackErrorMessage]);

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
