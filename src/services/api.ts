import * as SecureStore from 'expo-secure-store';
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

const resolveDevelopmentHost = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      if (Platform.OS === 'android') {
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

const rawBaseURL = (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://localhost:5000';
const baseURL = resolveDevelopmentHost(normalizeBaseURL(rawBaseURL));

export const AUTH_TOKEN_KEY = 'closing_engage_token';
export const AUTH_USER_KEY = 'closing_engage_user';
export const AUTH_ONBOARDING_KEY = 'closing_engage_onboarding';

let unauthorizedHandler: (() => void | Promise<void>) | null = null;
let unauthorizedHandled = false;
let authTokenCache: string | null = null;

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export class ApiClientError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
  }
}

export const registerUnauthorizedHandler = (handler: (() => void | Promise<void>) | null) => {
  unauthorizedHandler = handler;
};

export const setAuthToken = (token: string | null) => {
  authTokenCache = token;
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
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const statusCode = axiosError.response?.status;
      const url = axiosError.config?.url;
      const method = axiosError.config?.method?.toUpperCase();

      console.log(`[API Response Error] ${method} ${url} Status: ${statusCode} Message: ${axiosError.response?.data?.message || axiosError.message}`);

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

      const message =
        (!axiosError.response && axiosError.message === 'Network Error'
          ? `Network Error. Mobile app could not reach ${baseURL}. Check that the backend is running and the emulator can access this host.`
          : undefined) ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Something went wrong while talking to the server';
      return Promise.reject(new ApiClientError(message, statusCode));
    }

    return Promise.reject(new ApiClientError('Unexpected API error'));
  },
);

export const unwrap = async <T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> => {
  const response = await request;
  return response.data.data;
};
