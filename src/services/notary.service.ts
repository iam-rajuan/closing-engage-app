import { api, unwrap } from '@/services/api';

export type NotaryScreeningStatus = 'Pending' | 'Verified' | 'Failed';
export type NotaryCredentialVerification = 'Auto-Verified' | 'Manual Review';
export type NotaryCredentialStatus = 'Pending' | 'Approved' | 'Rejected';

export type NotaryCredentialRecord = {
  id: string;
  documentName: string;
  issuer: string;
  uploadDate: string;
  verification: NotaryCredentialVerification;
  status: NotaryCredentialStatus;
};

export type NotaryCredentials = {
  licenseNumber: string;
  commissionAuthority: string;
  commissionExpiry: string;
  eoCoverage: string;
  verified: boolean;
  backgroundScreeningStatus: NotaryScreeningStatus;
  backgroundScreeningDetail: string;
  credentials: NotaryCredentialRecord[];
};

export type CommissionUpdateInput = Partial<{
  licenseNumber: string;
  commissionAuthority: string;
  commissionExpiry: string;
  eoCoverage: string;
  backgroundScreeningStatus: NotaryScreeningStatus;
  backgroundScreeningDetail: string;
}>;

export type CredentialUploadInput = {
  documentName: string;
  issuer: string;
  verification?: NotaryCredentialVerification;
};

export async function getNotaryCredentials() {
  return unwrap<NotaryCredentials>(api.get('/api/v1/notary/credentials'));
}

export async function updateNotaryCommission(input: CommissionUpdateInput) {
  return unwrap<NotaryCredentials>(api.patch('/api/v1/notary/credentials', input));
}

export async function addNotaryCredential(input: CredentialUploadInput) {
  return unwrap<NotaryCredentials>(api.post('/api/v1/notary/credentials', input));
}
