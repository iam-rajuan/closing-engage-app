import axios from 'axios';
import Constants from 'expo-constants';

const baseURL = Constants.expoConfig?.extra?.apiUrl as string | undefined;

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  // Inject SecureStore auth token here when the backend contract is finalized.
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Centralized normalization hook for production API errors.
    return Promise.reject(error);
  },
);
