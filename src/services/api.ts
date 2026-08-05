import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import axios, { AxiosError, AxiosHeaders } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PREFIX = '/api/v1';

const normalizeBaseURL = (value: string) => {
  const trimmed = value.trim().replace(/\/+$/, '');
  return trimmed.endsWith(API_PREFIX) ? trimmed.slice(0, -API_PREFIX.length) : trimmed;
};

const debuggerHost = (Constants as unknown as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig?.debuggerHost;
const expoHost = debuggerHost ? debuggerHost.split(':')[0]?.trim() || undefined : undefined;
const isAndroidEmulator = Platform.OS === 'android' && !Device.isDevice;

const resolveDevelopmentHost = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      if (isAndroidEmulator) {
        parsed.hostname = '10.0.2.2';
      } else if (expoHost) {
        parsed.hostname = expoHost;
      }
    }

    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return url;
  }
};

const rawBaseURL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'http://localhost:8000';
const baseURL = resolveDevelopmentHost(normalizeBaseURL(rawBaseURL));

export const getApiBaseURL = () => baseURL;

export const AUTH_TOKEN_KEY = 'closing_engage_token';
export const AUTH_REFRESH_TOKEN_KEY = 'closing_engage_refresh_token';
export const AUTH_USER_KEY = 'closing_engage_user';
export const AUTH_ONBOARDING_KEY = 'closing_engage_onboarding';

let unauthorizedHandler: (() => void | Promise<void>) | null = null;
let unauthorizedHandled = false;
let authTokenCache: string | null = null;
let refreshTokenCache: string | null = null;
let refreshSessionHandler:
  | null
  | (() => Promise<{ accessToken: string; refreshToken: string } | null>) = null;
let refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiErrorKind = 'network' | 'timeout' | 'server' | 'auth' | 'validation' | 'unknown';

export class ApiClientError extends Error {
  statusCode?: number;
  kind: ApiErrorKind;

  constructor(message: string, statusCode?: number, kind: ApiErrorKind = 'unknown') {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.kind = kind;
  }
}

const normalizeApiErrorMessage = (
  statusCode: number | undefined,
  axiosMessage: string | undefined,
  responseMessage: string | undefined,
): { message: string; kind: ApiErrorKind } => {
  if (axiosMessage?.toLowerCase().includes('timeout')) {
    return {
      kind: 'timeout',
      message: 'Closing Engage is taking longer than expected to respond. Please try again in a moment.',
    };
  }

  if (!statusCode) {
    return {
      kind: 'network',
      message: 'Unable to connect to Closing Engage right now. Check your internet connection and try again.',
    };
  }

  if (statusCode >= 500) {
    return {
      kind: 'server',
      message: 'Closing Engage is temporarily unavailable. Please try again in a moment.',
    };
  }

  if (statusCode === 401) {
    return {
      kind: 'auth',
      message: responseMessage || 'Your session could not be verified. Please sign in again.',
    };
  }

  if (statusCode === 400 || statusCode === 403 || statusCode === 404 || statusCode === 409 || statusCode === 422) {
    return {
      kind: 'validation',
      message: responseMessage || 'We could not complete your request. Please review your details and try again.',
    };
  }

  return {
    kind: 'unknown',
    message: responseMessage || 'Something went wrong while talking to Closing Engage. Please try again.',
  };
};

export const describeApiError = (
  error: unknown,
  fallbackTitle = 'Something went wrong',
  fallbackDescription = 'Please try again.',
) => {
  if (error instanceof ApiClientError) {
    switch (error.kind) {
      case 'timeout':
      case 'network':
      case 'server':
        return {
          title: 'Connection Issue',
          description: error.message,
        };
      case 'auth':
        return {
          title: 'Sign-In Issue',
          description: error.message,
        };
      case 'validation':
        return {
          title: 'Action Needed',
          description: error.message,
        };
      default:
        return {
          title: fallbackTitle,
          description: error.message || fallbackDescription,
        };
    }
  }

  if (error instanceof Error) {
    return {
      title: fallbackTitle,
      description: error.message || fallbackDescription,
    };
  }

  return {
    title: fallbackTitle,
    description: fallbackDescription,
  };
};

export const registerUnauthorizedHandler = (handler: (() => void | Promise<void>) | null) => {
  unauthorizedHandler = handler;
};

export const registerRefreshSessionHandler = (
  handler: (() => Promise<{ accessToken: string; refreshToken: string } | null>) | null,
) => {
  refreshSessionHandler = handler;
};

export const setAuthSessionTokens = (accessToken: string | null, refreshToken: string | null) => {
  authTokenCache = accessToken;
  refreshTokenCache = refreshToken;
};

export const getAuthToken = async () => {
  if (authTokenCache) {
    return authTokenCache;
  }

  const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  if (storedToken) {
    authTokenCache = storedToken;
  }

  return storedToken;
};

export const getRefreshToken = async () => {
  if (refreshTokenCache) {
    return refreshTokenCache;
  }

  const storedRefreshToken = await SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_KEY);
  if (storedRefreshToken) {
    refreshTokenCache = storedRefreshToken;
  }

  return storedRefreshToken;
};

const tryRefreshSession = async () => {
  if (!refreshSessionHandler) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = refreshSessionHandler().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const api = axios.create({
  baseURL,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} (Token present: ${!!token})`);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response Success] ${response.config.method?.toUpperCase()} ${response.config.url} Status: ${response.status}`);
    return response;
  },
  async (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const statusCode = axiosError.response?.status;
      const url = axiosError.config?.url;
      const method = axiosError.config?.method?.toUpperCase();
      const originalRequest = axiosError.config as (typeof axiosError.config & { _retry?: boolean }) | undefined;

      console.log(`[API Response Error] ${method} ${url} Status: ${statusCode} Message: ${axiosError.response?.data?.message || axiosError.message}`);

      if (statusCode === 401 && originalRequest && !originalRequest._retry && !String(url || '').includes('/auth/portal/refresh')) {
        originalRequest._retry = true;

        try {
          const refreshedTokens = await tryRefreshSession();
          if (refreshedTokens?.accessToken) {
            originalRequest.headers = AxiosHeaders.from(originalRequest.headers ?? {});
            originalRequest.headers.set('Authorization', `Bearer ${refreshedTokens.accessToken}`);
            return api.request(originalRequest);
          }
        } catch {
          // Fall through to the unauthorized handler.
        }
      }

      if (statusCode === 401 && !unauthorizedHandled) {
        unauthorizedHandled = true;
        console.log(`[API Auth] 401 Unauthorized detected for ${url}. Triggering unauthorizedHandler (logout).`);
        Promise.resolve(unauthorizedHandler?.())
          .catch(() => {
            // Ignore cleanup errors so the original API failure still surfaces.
          })
          .finally(() => {
            unauthorizedHandled = false;
          });
      }

      const normalized = normalizeApiErrorMessage(
        statusCode,
        axiosError.message,
        axiosError.response?.data?.message,
      );

      return Promise.reject(new ApiClientError(normalized.message, statusCode, normalized.kind));
    }

    return Promise.reject(new ApiClientError('Something went wrong while talking to Closing Engage. Please try again.', undefined, 'unknown'));
  },
);

export const unwrap = async <T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> => {
  const response = await request;
  return response.data.data;
};
