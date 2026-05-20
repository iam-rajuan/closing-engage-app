export type DocumentFile = {
  id: string;
  name: string;
  orderId: string;
  status:
    | 'Pending Review'
    | 'Submitted'
    | 'Approved'
    | 'Rejected'
    | 'Resubmission Requested'
    | 'Archived';
  uploadedDate: string;
  size: string;
  uploadedBy?: string;
  orderNumber?: string;
  mimeType?: string;
  comments?: string;
};
