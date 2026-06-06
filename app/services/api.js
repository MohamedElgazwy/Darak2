"use client";

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://darak.runasp.net/API";

const TOKEN_KEY = "authToken";
const REFRESH_KEY = "refreshToken";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let queue = [];

const processQueue = (token) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(REFRESH_KEY);
    const token = localStorage.getItem(TOKEN_KEY);

    if (!refreshToken || !token) {
      window.location.href = "/auth/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const res = await axios.post(
        `${BASE_URL}/Auth/Refresh`,
        { token, refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res?.data?.data ?? res?.data?.result ?? res?.data;
      const newToken = data?.token;
      const newRefresh = data?.refreshToken;

      if (newToken) localStorage.setItem(TOKEN_KEY, newToken);
      if (newRefresh) localStorage.setItem(REFRESH_KEY, newRefresh);

      api.defaults.headers.Authorization = `Bearer ${newToken}`;
      processQueue(newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (err) {
      localStorage.clear();
      window.location.href = "/auth/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;