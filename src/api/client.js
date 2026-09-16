// src/api/client.js
// Shared API client for the RightTouch Admin/Owner backend.
// Base URL resolves to `${REACT_APP_API_BASE_URL}/api` so call sites use
// paths like `/user/owner/login` instead of repeating `/api`.
import axios from "axios";
import { getToken, clearAuth, handleSessionExpiry } from "views/utils/axiosInstance";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://righttouchservernew-727889857503.asia-south1.run.app";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      if (!url.includes("/login") && !url.includes("/signin")) {
        handleSessionExpiry();
      } else {
        clearAuth();
      }
    }
    return Promise.reject(error);
  }
);

// `data` = response body, `err` = normalized error message
export const handle = async (promise) => {
  try {
    const res = await promise;
    return { data: res.data, error: null };
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Request failed";
    return { data: null, error: message };
  }
};

export default apiClient;
