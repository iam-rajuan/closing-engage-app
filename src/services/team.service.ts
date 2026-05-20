import { api, unwrap } from '@/services/api';
import { TeamMember } from '@/types/team';

type BackendTeamMember = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: TeamMember['role'];
  status: TeamMember['status'];
  joinedDate: string;
  permissions?: TeamMember['permissions'];
};

type CreateTeamMemberInput = {
  name: string;
  email: string;
  phone?: string;
  role: TeamMember['role'];
  permissions: NonNullable<TeamMember['permissions']>;
  sendInvite: boolean;
};

type UpdateTeamMemberInput = Partial<CreateTeamMemberInput> & {
  status?: TeamMember['status'];
};

const initialsFrom = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const normalizeTeamMember = (member: BackendTeamMember): TeamMember => ({
  id: member.id,
  name: member.name,
  email: member.email,
  role: member.role,
  joinedLabel: member.joinedDate,
  status: member.status,
  avatar: initialsFrom(member.name),
  phone: member.phone,
  permissions: member.permissions,
});

export async function getTeamMembers() {
  const result = await unwrap<BackendTeamMember[]>(api.get('/api/v1/team'));
  return result.map(normalizeTeamMember);
}

export async function createTeamMember(input: CreateTeamMemberInput) {
  const result = await unwrap<{ member: BackendTeamMember; temporaryPassword: string; inviteDelivered: boolean }>(
    api.post('/api/v1/team', input),
  );

  return {
    member: normalizeTeamMember(result.member),
    temporaryPassword: result.temporaryPassword,
    inviteDelivered: result.inviteDelivered,
  };
}

export async function updateTeamMember(email: string, input: UpdateTeamMemberInput) {
  const encodedEmail = encodeURIComponent(email);
  const result = await unwrap<BackendTeamMember>(api.patch(`/api/v1/team/${encodedEmail}`, input));
  return normalizeTeamMember(result);
}

export async function deleteTeamMember(email: string) {
  const encodedEmail = encodeURIComponent(email);
  await unwrap<Record<string, never>>(api.delete(`/api/v1/team/${encodedEmail}`));
}
