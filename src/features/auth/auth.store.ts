import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { AuthState } from './auth.types';
import { UserRole } from '@/types/user';

const TOKEN_KEY = 'closing_engage_token';
const USER_KEY = 'closing_engage_user';
const ONBOARDING_KEY = 'closing_engage_onboarding';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hasCompletedOnboarding: false,
  isHydrated: false,
  hydrate: async () => {
    const [token, userRaw, onboarded] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(USER_KEY),
      SecureStore.getItemAsync(ONBOARDING_KEY),
    ]);
    set({
      token,
      user: userRaw ? JSON.parse(userRaw) : null,
      hasCompletedOnboarding: onboarded === 'true',
      isHydrated: true,
    });
  },
  completeOnboarding: async () => {
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    set({ hasCompletedOnboarding: true });
  },
  login: async (role: UserRole, email: string) => {
    const user = {
      id: role === 'company' ? 'company-demo' : 'notary-demo',
      name: role === 'company' ? 'Alex Thompson' : 'Sarah Miller',
      email,
      role,
      company: role === 'company' ? 'Estate Flux Title' : undefined,
      avatarInitials: role === 'company' ? 'AT' : 'SM',
    };
    const token = `demo-${role}-token`;
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
    set({ token, user });
  },
  logout: async () => {
    await Promise.all([SecureStore.deleteItemAsync(TOKEN_KEY), SecureStore.deleteItemAsync(USER_KEY)]);
    set({ token: null, user: null });
  },
}));
