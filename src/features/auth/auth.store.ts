import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { fetchPortalSession, loginPortal } from '@/services/auth.service';
import { AUTH_ONBOARDING_KEY, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/services/api';
import { AuthState } from './auth.types';

const decodeTokenRole = (token: string): 'company' | 'notary' | null => {
  try {
    const [, payloadSegment] = token.split('.');
    if (!payloadSegment) {
      return null;
    }

    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    const payloadJson = globalThis.atob(`${normalized}${padding}`);
    const payload = JSON.parse(payloadJson) as { role?: unknown };

    return payload.role === 'company' || payload.role === 'notary' ? payload.role : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hasCompletedOnboarding: false,
  isHydrated: false,
  hydrate: async () => {
    const [token, onboarded] = await Promise.all([
      SecureStore.getItemAsync(AUTH_TOKEN_KEY),
      SecureStore.getItemAsync(AUTH_ONBOARDING_KEY),
    ]);
    const role = token ? decodeTokenRole(token) : null;

    if (token && role) {
      try {
        const freshUser = await fetchPortalSession(role);
        await SecureStore.deleteItemAsync(AUTH_USER_KEY);
        set({
          token,
          user: freshUser,
          hasCompletedOnboarding: onboarded === 'true',
          isHydrated: true,
        });
        return;
      } catch {
        await Promise.all([
          SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
          SecureStore.deleteItemAsync(AUTH_USER_KEY),
        ]);
      }
    }

    set({
      token: null,
      user: null,
      hasCompletedOnboarding: onboarded === 'true',
      isHydrated: true,
    });
  },
  completeOnboarding: async () => {
    await SecureStore.setItemAsync(AUTH_ONBOARDING_KEY, 'true');
    set({ hasCompletedOnboarding: true });
  },
  login: async (role, email, password) => {
    const session = await loginPortal(role, email, password);
    await Promise.all([
      SecureStore.setItemAsync(AUTH_TOKEN_KEY, session.token),
      SecureStore.deleteItemAsync(AUTH_USER_KEY),
    ]);
    set({ token: session.token, user: session.user });
  },
  setUser: async (user) => {
    await SecureStore.deleteItemAsync(AUTH_USER_KEY);
    set({ user });
  },
  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
      SecureStore.deleteItemAsync(AUTH_USER_KEY),
    ]);
    set({ token: null, user: null });
  },
}));
