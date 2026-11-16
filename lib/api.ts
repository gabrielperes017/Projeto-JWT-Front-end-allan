import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

export type User = { id: number; name: string; email: string; isAdmin: boolean; active: boolean };

export function saveSession(accessToken: string, refreshToken: string, user?: User) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  if (user) localStorage.setItem("user", JSON.stringify(user));
  document.cookie = "session=1; path=/; SameSite=Lax";
}

export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  document.cookie = "session=; path=/; max-age=0";
}

export function getUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export const errorMessage = (e: unknown) =>
  (e as AxiosError<{ error?: string }>).response?.data?.error || "Erro inesperado";

const api = axios.create({ baseURL, headers: { "Content-Type": "application/json" } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string> | null = null;

async function refreshTokens(): Promise<string> {
  const refreshToken = localStorage.getItem("refreshToken");
  const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
  saveSession(res.data.accessToken, res.data.refreshToken, res.data.user);
  return res.data.accessToken;
}

type Retryable = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as Retryable | undefined;
    const url = original?.url || "";
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      url.endsWith("/auth/login") ||
      url.endsWith("/auth/refresh")
    ) {
      return Promise.reject(error);
    }
    original._retry = true;
    try {
      refreshing ??= refreshTokens().finally(() => {
        refreshing = null;
      });
      const token = await refreshing;
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (refreshError) {
      clearSession();
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/";
      return Promise.reject(refreshError);
    }
  }
);

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  saveSession(res.data.accessToken, res.data.refreshToken, res.data.user);
}

export async function logout() {
  const refreshToken = localStorage.getItem("refreshToken");
  try {
    await axios.post(`${baseURL}/auth/logout`, { refreshToken });
  } finally {
    clearSession();
  }
}

export default api;
