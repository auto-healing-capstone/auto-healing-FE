import axios from "axios";

const API_PREFIX = "/api/v1";
const DEFAULT_API_BASE_URL = `http://34.158.201.96:8000${API_PREFIX}`;

const normalizeApiBaseUrl = (baseUrl: string) => {
  const trimmedBaseUrl = baseUrl.replace(/\/+$/, "");
  return trimmedBaseUrl.endsWith(API_PREFIX) ? trimmedBaseUrl : `${trimmedBaseUrl}${API_PREFIX}`;
};

function resolveBaseUrl(): string {
  try {
    const saved = localStorage.getItem("aiops_settings");
    if (saved) {
      const parsed = JSON.parse(saved) as { integrations?: { backendBaseUrl?: string } };
      if (parsed.integrations?.backendBaseUrl) {
        return normalizeApiBaseUrl(parsed.integrations.backendBaseUrl);
      }
    }
  } catch {
    // ignore
  }
  return normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL);
}

export const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 5000,
});

export function applyBaseUrl(url: string) {
  apiClient.defaults.baseURL = normalizeApiBaseUrl(url);
}
