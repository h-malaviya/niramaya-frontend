"use client";

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

let isRefreshing = false;
let queue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  queue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  queue = [];
};

// Request interceptor - add access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Don't retry if:
    // 1. Already retried
    // 2. Is the refresh-token endpoint itself
    // 3. Is a login/signup request
    if (
      original._retry ||
      original.url?.includes("/refresh-token") ||
      original.url?.includes("/login") ||
      original.url?.includes("/signup")
    ) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      original._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(() => api(original));
      }

      isRefreshing = true;

      try {
        const res = await api.post("/refresh-token");

        const newAccess = res.data.access_token;
        localStorage.setItem("access_token", newAccess);

        processQueue(null, newAccess);
        isRefreshing = false;

        // Retry the original request
        return api(original);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;

        // Refresh failed - clear everything and redirect
        clearAuthAndRedirect();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ==================== HELPER FUNCTIONS ====================

/**
 * Clear all authentication data and redirect to login
 */
function clearAuthAndRedirect() {
  // Clear localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("role");
  localStorage.removeItem("chat_thread_id");

  // Clear cookies (client-side)
  clearClientCookies();

  // Redirect to login using replace to prevent back navigation
  const currentPath = window.location.pathname;
  if (currentPath !== "/login") {
    window.location.replace(`/login`);
  }
}

/**
 * Clear auth cookies on the client side
 */
function clearClientCookies() {
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "refresh_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "role=; path=/; max-age=0; SameSite=Lax";
}

/**
 * Extract error message from API error
 */
export function getErrorMessage(err: any): string {
  // Axios error
  const detail = err?.response?.data?.detail;

  // Case 1: plain string
  if (typeof detail === "string") {
    return detail;
  }

  // Case 2: Pydantic validation error (array)
  if (Array.isArray(detail)) {
    return detail.map((e) => e.msg).join(", ");
  }

  // Case 3: fallback
  return err?.message || "Something went wrong. Please try again.";
}

/**
 * Manual logout function
 */
export async function logout() {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    
    if (refreshToken) {
      // Call logout endpoint (don't await or handle errors - we're logging out anyway)
      api.post(`/logout?refresh_token=${refreshToken}`).catch(() => {});
    }
  } finally {
    // Always clear auth data and redirect
    clearAuthAndRedirect();
  }
}
