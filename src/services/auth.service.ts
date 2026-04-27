import { UserRole } from '@/types/user';

export async function demoLogin(role: UserRole, email: string) {
  return {
    token: `demo-${role}-token`,
    user: {
      id: `${role}-demo`,
      role,
      email,
      name: role === 'company' ? 'Alex Thompson' : 'Sarah Miller',
      avatarInitials: role === 'company' ? 'AT' : 'SM',
    },
  };
}
