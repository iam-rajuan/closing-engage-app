import * as SecureStore from 'expo-secure-store';
import { createStore } from 'zustand/vanilla';
import { fetchPortalSession, loginPortal } from '@/services/auth.service';
import { AUTH_ONBOARDING_KEY, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/services/api';
import { AuthState } from './auth.types';
import { User } from '@/types/user';

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

const parseStoredUser = (value: string | null): User | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as User;
    return parsed?.role === 'company' || parsed?.role === 'notary' ? parsed : null;
  } catch {
    return null;
  }
};

const persistUser = async (user: User | null) => {
  if (!user) {
    await SecureStore.deleteItemAsync(AUTH_USER_KEY);
    return;
  }

  await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(user));
};

export const authStore = createStore<AuthState>((set) => ({
  user: null,
  token: null,
  hasCompletedOnboarding: false,
  isHydrated: false,
  hydrate: async () => {
    const [token, onboarded, storedUserValue] = await Promise.all([
      SecureStore.getItemAsync(AUTH_TOKEN_KEY),
      SecureStore.getItemAsync(AUTH_ONBOARDING_KEY),
      SecureStore.getItemAsync(AUTH_USER_KEY),
    ]);
    const storedUser = parseStoredUser(storedUserValue);
    const role = token ? decodeTokenRole(token) ?? storedUser?.role ?? null : null;

    if (token && role) {
      try {
        const freshUser = await fetchPortalSession(role);
        await persistUser(freshUser);
        set({
          token,
          user: freshUser,
          hasCompletedOnboarding: onboarded === 'true',
          isHydrated: true,
        });
        return;
      } catch {
        if (storedUser?.role === role) {
          set({
            token,
            user: storedUser,
            hasCompletedOnboarding: onboarded === 'true',
            isHydrated: true,
          });
          return;
        }

        await Promise.all([SecureStore.deleteItemAsync(AUTH_TOKEN_KEY), SecureStore.deleteItemAsync(AUTH_USER_KEY)]);
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
    await Promise.all([SecureStore.setItemAsync(AUTH_TOKEN_KEY, session.token), persistUser(session.user)]);
    set({ token: session.token, user: session.user });
    return session.user;
  },
  setUser: async (user) => {
    await persistUser(user);
    set({ user });
  },
  logout: async () => {
    await Promise.all([SecureStore.deleteItemAsync(AUTH_TOKEN_KEY), SecureStore.deleteItemAsync(AUTH_USER_KEY)]);
    set({ token: null, user: null });
  },
}));
