export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  joinedLabel: string;
  status: 'Active' | 'Pending Invite';
  avatar: string;
};
