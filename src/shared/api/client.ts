import axios from "axios";

const API_PREFIX = "/api/v1";
const DEFAULT_API_BASE_URL = `http://localhost:8000${API_PREFIX}`;

const normalizeApiBaseUrl = (baseUrl: string) => {
  const trimmedBaseUrl = baseUrl.replace(/\/+$/, "");

  return trimmedBaseUrl.endsWith(API_PREFIX)
    ? trimmedBaseUrl
    : `${trimmedBaseUrl}${API_PREFIX}`;
};

export const apiClient = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL),
  timeout: 5000,
});
