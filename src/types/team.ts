export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  joinedLabel: string;
  status: 'Active' | 'Pending Invite' | 'Inactive';
  avatar: string;
  phone?: string;
  permissions?: {
    createOrders: boolean;
    viewOrders: boolean;
    downloadDocuments: boolean;
  };
};
