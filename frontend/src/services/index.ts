import axios from "axios";

import { API_BASE_URL } from "@/utils/constants/api.constants";

import { handleUnauthorized, normalizeError } from "./interceptors";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.response.use(null, handleUnauthorized);
apiClient.interceptors.response.use(null, normalizeError);
