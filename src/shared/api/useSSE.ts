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

export interface SSENewIncidentData {
  incident_id: number;
  ai_title: string | null;
  ai_severity: string | null;
  status: string;
}

export interface SSEStatusChangedData {
  incident_id: number;
  status: string;
}

export interface SSERecoveryCompletedData {
  incident_id: number;
  is_successful: boolean;
  action_type: string;
}

export interface SSEHandlers {
  onNewIncident?: (data: SSENewIncidentData) => void;
  onStatusChanged?: (data: SSEStatusChangedData) => void;
  onRecoveryCompleted?: (data: SSERecoveryCompletedData) => void;
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
          handlersRef.current.onNewIncident?.(JSON.parse(event.data as string) as SSENewIncidentData);
        } catch {
          /* malformed event — skip */
        }
      });

      es.addEventListener("status_changed", (event: MessageEvent) => {
        try {
          handlersRef.current.onStatusChanged?.(JSON.parse(event.data as string) as SSEStatusChangedData);
        } catch {
          /* malformed event — skip */
        }
      });

      es.addEventListener("recovery_completed", (event: MessageEvent) => {
        try {
          handlersRef.current.onRecoveryCompleted?.(JSON.parse(event.data as string) as SSERecoveryCompletedData);
        } catch {
          /* malformed event — skip */
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
