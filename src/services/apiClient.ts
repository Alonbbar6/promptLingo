import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authService } from './authService';
import { tokenStorage } from './tokenStorage';
import { isNativeApp } from '../utils/platform';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      // SECURITY: Send HttpOnly cookies with requests (for web)
      withCredentials: true,
    });

    // Request interceptor to add Authorization header on mobile
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (isNativeApp()) {
          // Add mobile app header
          config.headers.set('X-Mobile-App', 'true');

          // Add Authorization header with stored token
          const accessToken = await tokenStorage.getAccessToken();
          if (accessToken) {
            config.headers.set('Authorization', `Bearer ${accessToken}`);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(async () => {
                // On mobile, update the Authorization header with new token
                if (isNativeApp()) {
                  const newToken = await tokenStorage.getAccessToken();
                  if (newToken) {
                    originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
                  }
                }
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Refresh the token
            await authService.refreshAccessToken();

            // Process queued requests
            this.failedQueue.forEach((prom) => {
              prom.resolve();
            });
            this.failedQueue = [];

            // On mobile, update the Authorization header with new token
            if (isNativeApp()) {
              const newToken = await tokenStorage.getAccessToken();
              if (newToken) {
                originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
              }
            }

            // Retry original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear queue and reload to show sign-in prompt
            this.failedQueue.forEach((prom) => {
              prom.reject(refreshError);
            });
            this.failedQueue = [];

            // Clear tokens on mobile
            if (isNativeApp()) {
              await tokenStorage.clearTokens();
            }

            // Set flag to show notification after reload
            localStorage.setItem('session_expired', 'true');
            window.location.reload();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
