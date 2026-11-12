import axios, { isAxiosError } from "axios";

import { API_BASE_URL } from "@/utils/constants/api";

const PATHS_WITHOUT_UNAUTHORIZED_HANDLER = new Set([
  "/auth/me",
  "/auth/login",
  "/users/me/password",
]);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function handleUnauthorized(error: unknown): Promise<never> {
  if (
    isAxiosError(error) &&
    error.response?.status === 401 &&
    !PATHS_WITHOUT_UNAUTHORIZED_HANDLER.has(error.config?.url ?? "")
  ) {
    unauthorizedHandler?.();
  }
  return Promise.reject(error instanceof Error ? error : new Error(String(error)));
}

apiClient.interceptors.response.use(undefined, handleUnauthorized);
