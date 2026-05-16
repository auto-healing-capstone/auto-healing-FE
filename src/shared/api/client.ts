import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://34.158.201.96:8000",
  timeout: 5000,
});
