export type OrderStatus =
  | 'Received'
  | 'Assigned'
  | 'Under Review'
  | 'Approved'
  | 'Completed'
  | 'In Progress'
  | 'Pending Upload'
  | 'Submitted'
  | 'Rejected';

export type OrderMeeting = {
  status: 'scheduled' | 'confirmed';
  date: string;
  time: string;
  scheduledByRole?: 'admin' | 'company' | 'notary';
  confirmedByRole?: 'admin' | 'company' | 'notary';
  scheduledAt?: string;
  confirmedAt?: string;
};

export type OrderDocumentSummary = {
  name: string;
  meta: string;
  uploadedBy?: string;
  uploadedAt?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  clientName: string;
  companyName?: string;
  companyAvatarUrl?: string;
  notaryName?: string;
  notaryAvatarUrl?: string;
  address: string;
  location: string;
  signingDate: string;
  signingTime?: string;
  status: OrderStatus;
  priority?: 'Normal' | 'Urgent';
  instructions?: string;
  title?: string;
  signerName?: string;
  signerPhone?: string;
  loanType?: string;
  scanbacksRequired?: boolean;
  preferredNotaryName?: string;
  notaryPrintedConfirmed?: boolean;
  assignedNotaryId?: string;
  openForAll?: boolean;
  meeting?: OrderMeeting | null;
  documents?: OrderDocumentSummary[];
  createdDate?: string;
};

export type TimelineStep = {
  label: string;
  time: string;
  done: boolean;
};
