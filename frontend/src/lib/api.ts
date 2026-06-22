import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      !(original as InternalAxiosRequestConfig & { _retry?: boolean })._retry
    ) {
      (original as InternalAxiosRequestConfig & { _retry?: boolean })._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          setCookie("drinsight_access", data.accessToken, 60 * 15);
          setCookie("drinsight_role", data.user.role, 60 * 60 * 24 * 7);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          deleteCookie("drinsight_access");
          deleteCookie("drinsight_role");
          if (typeof window !== "undefined") window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export const aiApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});
