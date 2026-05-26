import { useStore } from 'zustand';
import { AuthState } from './auth.types';
import { authStore } from './auth.state';

const identity = (state: AuthState) => state;

export function useAuthStore(): AuthState;
export function useAuthStore<T>(selector: (state: AuthState) => T): T;
export function useAuthStore<T>(selector?: (state: AuthState) => T) {
  const resolvedSelector = (selector ?? identity) as (state: AuthState) => T;
  return useStore(authStore, resolvedSelector);
}
