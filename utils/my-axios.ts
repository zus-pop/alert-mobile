// src/axios/axiosInstance.ts
import axios from "axios";
import { router } from "expo-router";
import { useAuthStore } from "../stores";

const myAxios = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api/`, // replace with actual API base URL
});

myAxios.interceptors.request.use((config) => {
  const { accessToken, refreshToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (refreshToken) {
    config.headers["x-refresh-token"] = refreshToken;
  }

  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

myAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { refreshToken, setAccessToken, logout } = useAuthStore.getState();
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("auth/refresh")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              resolve(myAxios(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await myAxios.get(`auth/refresh`, {
          headers: {
            "x-refresh-token": refreshToken,
          },
        });

        const newAccessToken = res.data.accessToken;
        setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return myAxios(originalRequest);
      } catch (err) {
        logout();
        processQueue(err, null);
        // TODO: logout logic here (e.g. redirect to login page)
        router.replace("/");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default myAxios;
