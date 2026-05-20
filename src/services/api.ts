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

export const api = axios.create({
  baseURL,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        (!axiosError.response && axiosError.message === 'Network Error'
          ? `Network Error. Mobile app could not reach ${baseURL}. Check that the backend is running and the emulator can access this host.`
          : undefined) ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Something went wrong while talking to the server';
      return Promise.reject(new ApiClientError(message, axiosError.response?.status));
    }

    return Promise.reject(new ApiClientError('Unexpected API error'));
  },
);

export const unwrap = async <T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> => {
  const response = await request;
  return response.data.data;
};
