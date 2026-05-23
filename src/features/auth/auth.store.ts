import { useStore } from 'zustand';
import { AuthState } from './auth.types';
import { authStore } from './auth.state';

const identity = (state: AuthState) => state;

export function useAuthStore(): AuthState;
export function useAuthStore<T>(selector: (state: AuthState) => T): T;
export function useAuthStore<T>(selector?: (state: AuthState) => T) {
  if (!selector) {
    return useStore(authStore, identity) as T;
  }

  return useStore(authStore, selector);
}
