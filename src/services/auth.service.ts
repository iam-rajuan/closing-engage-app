import { api, unwrap } from '@/services/api';
import { User, UserRole } from '@/types/user';

type PortalLoginResponse = {
  accessToken: string;
  refreshToken: string;
  token: string;
  role: UserRole;
  redirectTo: string;
  user: Record<string, unknown>;
};

type CompanyMeResponse = {
  company: Record<string, unknown>;
};

type NotaryMeResponse = {
  notary: Record<string, unknown>;
};

const initialsFrom = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || value.trim().slice(0, 2).toUpperCase();

const normalizeCompanyUser = (input: Record<string, unknown>): User => {
  const name =
    typeof input.name === 'string' && input.name.trim()
      ? input.name
      : typeof input.contactPerson === 'string' && input.contactPerson.trim()
        ? input.contactPerson
        : typeof input.companyName === 'string'
          ? input.companyName
          : 'Company User';

  const companyName = typeof input.companyName === 'string' ? input.companyName : undefined;

  return {
    id: String(input.id ?? ''),
    role: 'company',
    email: String(input.email ?? input.businessEmail ?? ''),
    name,
    fullName: typeof input.fullName === 'string' ? input.fullName : name,
    company: companyName,
    phone: typeof input.phone === 'string' ? input.phone : undefined,
    status: typeof input.status === 'string' ? input.status : undefined,
    avatarUrl: typeof input.avatarUrl === 'string' ? input.avatarUrl : undefined,
    avatarInitials: initialsFrom(name),
    accountType:
      input.accountType === 'team-member' || input.accountType === 'owner'
        ? input.accountType
        : 'owner',
    memberRole: input.memberRole === 'Admin' || input.memberRole === 'Member' ? input.memberRole : undefined,
    permissions: {
      createOrders: Boolean((input.permissions as User['permissions'] | undefined)?.createOrders ?? true),
      viewOrders: Boolean((input.permissions as User['permissions'] | undefined)?.viewOrders ?? true),
      downloadDocuments: Boolean((input.permissions as User['permissions'] | undefined)?.downloadDocuments ?? true),
    },
    notifications: input.notifications
      ? {
          email: Boolean((input.notifications as any).email ?? true),
          orders: Boolean((input.notifications as any).orders ?? true),
          documents: Boolean((input.notifications as any).documents ?? true),
        }
      : {
          email: true,
          orders: true,
          documents: true,
        },
  };
};

const normalizeNotaryUser = (input: Record<string, unknown>): User => {
  const name =
    typeof input.name === 'string' && input.name.trim()
      ? input.name
      : typeof input.fullName === 'string'
        ? input.fullName
        : 'Notary User';

  return {
    id: String(input.id ?? ''),
    role: 'notary',
    email: String(input.email ?? ''),
    name,
    fullName: typeof input.fullName === 'string' ? input.fullName : name,
    phone: typeof input.phone === 'string' ? input.phone : undefined,
    status: typeof input.status === 'string' ? input.status : undefined,
    avatarUrl: typeof input.avatarUrl === 'string' ? input.avatarUrl : undefined,
    avatarInitials: initialsFrom(name),
    permissions: {
      createOrders: false,
      viewOrders: true,
      downloadDocuments: true,
    },
    notifications: input.notifications
      ? {
          email: Boolean((input.notifications as any).email ?? true),
          orders: Boolean((input.notifications as any).orders ?? true),
          documents: Boolean((input.notifications as any).documents ?? true),
        }
      : {
          email: true,
          orders: true,
          documents: true,
        },
  };
};

export const normalizePortalUser = (role: UserRole, input: Record<string, unknown>): User =>
  role === 'company' ? normalizeCompanyUser(input) : normalizeNotaryUser(input);

export async function loginPortal(_role: UserRole | undefined, email: string, password: string) {
  const result = await unwrap<PortalLoginResponse>(
    api.post('/api/v1/auth/portal/login', {
      email,
      password,
    }),
  );

  return {
    accessToken: result.accessToken || result.token,
    refreshToken: result.refreshToken,
    user: normalizePortalUser(result.role, result.user),
  };
}

export async function refreshPortalSession(refreshToken: string) {
  const result = await unwrap<PortalLoginResponse>(
    api.post('/api/v1/auth/portal/refresh', {
      refreshToken,
    }),
  );

  return {
    accessToken: result.accessToken || result.token,
    refreshToken: result.refreshToken,
  };
}

export async function logoutPortalSession(refreshToken: string) {
  await unwrap(
    api.post('/api/v1/auth/portal/logout', {
      refreshToken,
    }),
  );
}

export async function fetchPortalSession(role: UserRole): Promise<User> {
  if (role === 'company') {
    const result = await unwrap<CompanyMeResponse>(api.get('/api/v1/auth/company/me'));
    return normalizeCompanyUser(result.company);
  }

  const result = await unwrap<NotaryMeResponse>(api.get('/api/v1/auth/notary/me'));
  return normalizeNotaryUser(result.notary);
}

export async function requestPasswordReset(email: string, role?: UserRole) {
  await unwrap(api.post('/api/v1/auth/forgot-password', { email, role }));
}

export async function verifyResetOtp(email: string, otp: string, role?: UserRole) {
  await unwrap(api.post('/api/v1/auth/verify-otp', { email, otp, role }));
}

export async function resetPasswordWithOtp(
  email: string,
  otp: string,
  role: UserRole | undefined,
  newPassword: string,
  confirmPassword: string
) {
  await unwrap(api.post('/api/v1/auth/reset-password', { email, otp, role, newPassword, confirmPassword }));
}

export async function updateCompanyProfile(input: {
  contactPerson: string;
  businessEmail: string;
  phone: string;
  companyName: string;
  contactEmail?: string;
  address?: string;
  avatarUrl?: string;
  notifications?: {
    email: boolean;
    orders: boolean;
    documents: boolean;
  };
}) {
  const payload = {
    contactPerson: input.contactPerson.trim() || undefined,
    businessEmail: input.businessEmail.trim() || undefined,
    phone: input.phone.trim() || undefined,
    companyName: input.companyName.trim() || undefined,
    contactEmail: input.contactEmail?.trim() || undefined,
    address: input.address?.trim() || undefined,
    avatarUrl: input.avatarUrl?.trim() || undefined,
    notifications: input.notifications,
  };

  const result = await unwrap<{ company: Record<string, unknown> }>(
    api.patch('/api/v1/auth/company/profile', payload),
  );
  return normalizeCompanyUser(result.company);
}

export async function updateCompanyNotificationPreferences(notifications: {
  email: boolean;
  orders: boolean;
  documents: boolean;
}) {
  const result = await unwrap<{ company: Record<string, unknown> }>(
    api.patch('/api/v1/auth/company/profile', { notifications }),
  );
  return normalizeCompanyUser(result.company);
}

export async function updateNotaryProfile(input: {
  fullName: string;
  specialty: string;
  email: string;
  phone: string;
  license: string;
  expiry?: string;
  serviceArea?: string;
  avatarUrl?: string;
  notifications?: {
    email: boolean;
    orders: boolean;
    documents: boolean;
  };
}) {
  const payload = {
    fullName: input.fullName.trim() || undefined,
    specialty: input.specialty.trim() || undefined,
    email: input.email.trim() || undefined,
    phone: input.phone.trim() || undefined,
    license: input.license.trim() || undefined,
    expiry: input.expiry?.trim() || undefined,
    serviceArea: input.serviceArea?.trim() || undefined,
    avatarUrl: input.avatarUrl?.trim() || undefined,
    notifications: input.notifications,
  };

  const result = await unwrap<{ notary: Record<string, unknown> }>(
    api.patch('/api/v1/auth/notary/profile', payload),
  );
  return normalizeNotaryUser(result.notary);
}

export async function updateNotaryNotificationPreferences(notifications: {
  email: boolean;
  orders: boolean;
  documents: boolean;
}) {
  const result = await unwrap<{ notary: Record<string, unknown> }>(
    api.patch('/api/v1/auth/notary/profile', { notifications }),
  );
  return normalizeNotaryUser(result.notary);
}

export async function updateCompanyPassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  await unwrap(api.patch('/api/v1/auth/company/password', input));
}

export async function updateNotaryPassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  await unwrap(api.patch('/api/v1/auth/notary/password', input));
}
