import { useEffect, useRef } from "react";

const SSE_URL = (() => {
  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (apiBase) {
    // Strip /api/v1 suffix — /ws/events is registered without it
    return apiBase.replace(/\/api\/v1\/?$/, "") + "/ws/events";
  }
  // Local dev without env var: go through vite proxy
  return "/ws/events";
})();

const RETRY_DELAY_MS = 5000;

export interface SSEHandlers {
  onNewIncident?: (data: unknown) => void;
  onStatusChanged?: (data: unknown) => void;
  onRecoveryCompleted?: (data: unknown) => void;
}

export function useSSE(handlers: SSEHandlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let unmounted = false;

    function connect() {
      es = new EventSource(SSE_URL);

      es.addEventListener("new_incident", (event: MessageEvent) => {
        try {
          handlersRef.current.onNewIncident?.(JSON.parse(event.data as string));
        } catch {
          handlersRef.current.onNewIncident?.(event.data);
        }
      });

      es.addEventListener("status_changed", (event: MessageEvent) => {
        try {
          handlersRef.current.onStatusChanged?.(JSON.parse(event.data as string));
        } catch {
          handlersRef.current.onStatusChanged?.(event.data);
        }
      });

      es.addEventListener("recovery_completed", (event: MessageEvent) => {
        try {
          handlersRef.current.onRecoveryCompleted?.(JSON.parse(event.data as string));
        } catch {
          handlersRef.current.onRecoveryCompleted?.(event.data);
        }
      });

      es.onerror = () => {
        es?.close();
        es = null;
        if (!unmounted) {
          retryTimer = setTimeout(connect, RETRY_DELAY_MS);
        }
      };
    }

    connect();

    return () => {
      unmounted = true;
      if (retryTimer !== null) clearTimeout(retryTimer);
      es?.close();
    };
  }, []);
}
