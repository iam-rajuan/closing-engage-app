export type DocumentFile = {
  id: string;
  name: string;
  orderId: string;
  status:
    | 'Pending Review'
    | 'Submitted'
    | 'Approved'
    | 'Verified'
    | 'Rejected'
    | 'Resubmission Requested'
    | 'Archived';
  uploadedDate: string;
  size: string;
  uploadedBy?: string;
  uploaderRole?: 'admin' | 'company' | 'notary' | 'buyer' | 'title-company';
  orderNumber?: string;
  mimeType?: string;
  comments?: string;
};
