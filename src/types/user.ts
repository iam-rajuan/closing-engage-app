export type UserRole = 'company' | 'notary';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  avatarInitials: string;
};
