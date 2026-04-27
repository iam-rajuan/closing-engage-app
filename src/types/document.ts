export type DocumentFile = {
  id: string;
  name: string;
  orderId: string;
  status: 'Approved' | 'Pending' | 'Uploaded' | 'Verified';
  uploadedDate: string;
  size: string;
  uploadedBy?: string;
};
