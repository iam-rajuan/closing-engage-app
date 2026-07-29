import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStore } from 'zustand/vanilla';
import { fetchPortalSession, loginPortal, logoutPortalSession, refreshPortalSession } from '@/services/auth.service';
import {
  AUTH_ONBOARDING_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  registerRefreshSessionHandler,
  setAuthSessionTokens,
} from '@/services/api';
import { unregisterCurrentDevicePushToken } from '@/services/push-devices.service';
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

const getOnboardingStatus = async () => {
  const [asyncValue, secureValue] = await Promise.all([
    AsyncStorage.getItem(AUTH_ONBOARDING_KEY),
    SecureStore.getItemAsync(AUTH_ONBOARDING_KEY),
  ]);

  if (asyncValue === 'true') {
    return true;
  }

  if (secureValue === 'true') {
    await AsyncStorage.setItem(AUTH_ONBOARDING_KEY, 'true');
    return true;
  }

  return false;
};

const persistOnboardingStatus = async () => {
  await AsyncStorage.setItem(AUTH_ONBOARDING_KEY, 'true');
};

const persistSessionTokens = async (accessToken: string | null, refreshToken: string | null) => {
  const writes: Promise<void>[] = [];

  if (accessToken) {
    writes.push(SecureStore.setItemAsync(AUTH_TOKEN_KEY, accessToken));
  } else {
    writes.push(SecureStore.deleteItemAsync(AUTH_TOKEN_KEY));
  }

  if (refreshToken) {
    writes.push(SecureStore.setItemAsync(AUTH_REFRESH_TOKEN_KEY, refreshToken));
  } else {
    writes.push(SecureStore.deleteItemAsync(AUTH_REFRESH_TOKEN_KEY));
  }

  await Promise.all(writes);
};

const refreshStoredPortalSession = async () => {
  const refreshToken = await SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    return null;
  }

  const session = await refreshPortalSession(refreshToken);
  setAuthSessionTokens(session.accessToken, session.refreshToken);
  await persistSessionTokens(session.accessToken, session.refreshToken);
  return session;
};

export const authStore = createStore<AuthState>((set) => ({
  user: null,
  token: null,
  hasCompletedOnboarding: false,
  isHydrated: false,
  hydrate: async () => {
    const [token, hasCompletedOnboarding, storedUserValue, storedRefreshToken] = await Promise.all([
      SecureStore.getItemAsync(AUTH_TOKEN_KEY),
      getOnboardingStatus(),
      SecureStore.getItemAsync(AUTH_USER_KEY),
      SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_KEY),
    ]);
    const storedUser = parseStoredUser(storedUserValue);
    const role = token ? decodeTokenRole(token) ?? storedUser?.role ?? null : null;

    if ((token || storedRefreshToken) && !hasCompletedOnboarding) {
      await persistOnboardingStatus();
    }

    if ((token || storedRefreshToken) && (role || storedUser?.role)) {
      try {
        if (token) {
          setAuthSessionTokens(token, storedRefreshToken);
        } else {
          await refreshStoredPortalSession();
        }

        const freshUser = await fetchPortalSession(role ?? storedUser!.role);
        await persistUser(freshUser);
        set({
          token: await SecureStore.getItemAsync(AUTH_TOKEN_KEY),
          user: freshUser,
          hasCompletedOnboarding,
          isHydrated: true,
        });
        return;
      } catch {
        if (storedUser?.role === role) {
          set({
            token,
            user: storedUser,
            hasCompletedOnboarding,
            isHydrated: true,
          });
          return;
        }

        setAuthSessionTokens(null, null);
        await Promise.all([
          SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
          SecureStore.deleteItemAsync(AUTH_REFRESH_TOKEN_KEY),
          SecureStore.deleteItemAsync(AUTH_USER_KEY),
        ]);
      }
    }

    setAuthSessionTokens(null, null);
    set({
      token: null,
      user: null,
      hasCompletedOnboarding,
      isHydrated: true,
    });
  },
  completeOnboarding: async () => {
    await persistOnboardingStatus();
    set({ hasCompletedOnboarding: true });
  },
  login: async (role, email, password) => {
    const session = await loginPortal(role, email, password);
    setAuthSessionTokens(session.accessToken, session.refreshToken);
    await Promise.all([
      persistSessionTokens(session.accessToken, session.refreshToken),
      persistOnboardingStatus(),
      persistUser(session.user),
    ]);
    set({ token: session.accessToken, user: session.user, hasCompletedOnboarding: true });
    return session.user;
  },
  setUser: async (user) => {
    await persistUser(user);
    set({ user });
  },
  logout: async () => {
    const refreshToken = await SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_KEY);
    await unregisterCurrentDevicePushToken().catch(() => {
      // Best-effort cleanup. Session teardown should still complete locally.
    });
    if (refreshToken) {
      await logoutPortalSession(refreshToken).catch(() => {
        // Local session teardown still proceeds if the server-side revoke fails.
      });
    }
    setAuthSessionTokens(null, null);
    await Promise.all([
      SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
      SecureStore.deleteItemAsync(AUTH_REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(AUTH_USER_KEY),
    ]);
    set((state) => ({ token: null, user: null, hasCompletedOnboarding: state.hasCompletedOnboarding }));
  },
}));

registerRefreshSessionHandler(async () => {
  try {
    return await refreshStoredPortalSession();
  } catch {
    return null;
  }
});
