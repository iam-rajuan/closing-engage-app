export type UserRole = 'company' | 'notary';

export type UserPermissions = {
  createOrders: boolean;
  viewOrders: boolean;
  downloadDocuments: boolean;
};

export type User = {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  fullName?: string;
  company?: string;
  phone?: string;
  status?: string;
  avatarUrl?: string;
  avatarInitials: string;
  accountType?: 'owner' | 'team-member';
  memberRole?: 'Admin' | 'Member';
  permissions: UserPermissions;
  notifications?: {
    email: boolean;
    orders: boolean;
    documents: boolean;
  };
  specialty?: string;
  license?: string;
  expiry?: string;
  serviceArea?: string;
  state?: string;
};

