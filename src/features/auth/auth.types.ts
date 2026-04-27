import { User, UserRole } from '@/types/user';

export type AuthState = {
  user: User | null;
  token: string | null;
  hasCompletedOnboarding: boolean;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  login: (role: UserRole, email: string) => Promise<void>;
  logout: () => Promise<void>;
};
