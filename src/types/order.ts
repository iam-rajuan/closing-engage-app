export type OrderStatus =
  | 'Received'
  | 'Assigned'
  | 'Under Review'
  | 'Approved'
  | 'Completed'
  | 'In Progress'
  | 'Pending Upload'
  | 'Submitted';

export type Order = {
  id: string;
  orderNumber: string;
  clientName: string;
  notaryName?: string;
  address: string;
  location: string;
  signingDate: string;
  status: OrderStatus;
  priority?: 'Normal' | 'Urgent';
  instructions?: string;
};

export type TimelineStep = {
  label: string;
  time: string;
  done: boolean;
};
