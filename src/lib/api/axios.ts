import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getCookieToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

function getCookieToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)access-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem("refresh-token");
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
        { refreshToken }
      );

      const newToken: string = data.accessToken;
      document.cookie = `access-token=${encodeURIComponent(newToken)}; path=/; max-age=900; SameSite=Strict`;
      localStorage.setItem("refresh-token", data.refreshToken);

      // Update Zustand store
      const { useAuthStore } = await import("@/store/authStore");
      const store = useAuthStore.getState();
      store.setAuth(newToken, store.user!);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      processQueue(null, newToken);
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      const { useAuthStore } = await import("@/store/authStore");
      useAuthStore.getState().clearAuth();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
