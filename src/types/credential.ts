export type Credential = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  status: 'Approved' | 'Archived' | 'Pending Review' | 'Verified';
};
