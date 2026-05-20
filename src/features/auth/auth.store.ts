import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { fetchPortalSession, loginPortal } from '@/services/auth.service';
import { AUTH_ONBOARDING_KEY, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/services/api';
import { AuthState } from './auth.types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hasCompletedOnboarding: false,
  isHydrated: false,
  hydrate: async () => {
    const [token, userRaw, onboarded] = await Promise.all([
      SecureStore.getItemAsync(AUTH_TOKEN_KEY),
      SecureStore.getItemAsync(AUTH_USER_KEY),
      SecureStore.getItemAsync(AUTH_ONBOARDING_KEY),
    ]);

    const cachedUser = userRaw ? JSON.parse(userRaw) : null;

    if (token && cachedUser?.role) {
      try {
        const freshUser = await fetchPortalSession(cachedUser.role);
        await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(freshUser));
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
      SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(session.user)),
    ]);
    set({ token: session.token, user: session.user });
  },
  setUser: async (user) => {
    if (user) {
      await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(AUTH_USER_KEY);
    }
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
