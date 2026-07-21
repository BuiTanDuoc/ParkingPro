import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/env';
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
} from '../utils/storage';
import { LoginResponse } from '../types/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

/** Được RootNavigator gán khi phiên hết hạn hẳn (refresh cũng fail) → điều hướng về Login. */
let onSessionExpired: (() => void) | null = null;
export function setOnSessionExpired(cb: () => void) {
  onSessionExpired = cb;
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Không cần đính token cho các endpoint auth công khai
  const isPublicAuthCall =
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/refresh-token') ||
    config.url?.includes('/auth/register-customer');

  if (!isPublicAuthCall) {
    const token = await getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  pendingQueue.forEach(cb => cb(token));
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh-token')) {
      // Refresh token cũng đã hết hạn/không hợp lệ → đăng xuất
      await clearAuthSession();
      onSessionExpired?.();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Đợi request refresh đang chạy hoàn tất, rồi retry với token mới
      return new Promise((resolve, reject) => {
        pendingQueue.push(token => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.set('Authorization', `Bearer ${token}`);
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) throw error;

      const { data } = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/refresh-token`,
        { refreshToken },
      );
      await updateAccessToken(data.accessToken, data.refreshToken);
      resolveQueue(data.accessToken);
      originalRequest.headers.set('Authorization', `Bearer ${data.accessToken}`);
      return apiClient(originalRequest);
    } catch (refreshError) {
      resolveQueue(null);
      await clearAuthSession();
      onSessionExpired?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
