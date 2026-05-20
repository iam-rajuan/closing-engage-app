import { api, unwrap } from '@/services/api';
import { DocumentFile } from '@/types/document';
import * as SecureStore from 'expo-secure-store';
import { AUTH_TOKEN_KEY } from '@/services/api';

type BackendDocument = {
  id: string;
  orderId?: string;
  orderNumber?: string;
  fileName: string;
  name?: string;
  status: DocumentFile['status'];
  uploadedDate?: string;
  uploadDate?: string;
  createdDate?: string;
  uploadedByName?: string;
  uploadedBy?: string;
  sizeLabel?: string;
  size?: string;
  mimeType?: string;
  comments?: string;
};

type DocumentUrlResponse = {
  url: string;
};

const normalizeDocument = (input: BackendDocument): DocumentFile => ({
  id: input.id,
  name: input.fileName || input.name || 'Untitled document',
  orderId: input.orderNumber || input.orderId || 'Unknown order',
  orderNumber: input.orderNumber,
  status: input.status,
  uploadedDate: input.uploadedDate || input.uploadDate || input.createdDate || 'Recently uploaded',
  size: input.sizeLabel || input.size || '0 MB',
  uploadedBy: input.uploadedByName || input.uploadedBy,
  mimeType: input.mimeType,
  comments: input.comments,
});

export async function getDocuments(search?: string) {
  const result = await unwrap<BackendDocument[]>(
    api.get('/api/v1/documents', {
      params: {
        shape: 'portal',
        ...(search ? { search } : {}),
      },
    }),
  );
  return result.map(normalizeDocument);
}

export async function getDocumentById(documentId: string) {
  const result = await unwrap<BackendDocument>(api.get(`/api/v1/documents/${encodeURIComponent(documentId)}`));
  return normalizeDocument(result);
}

export async function getDocumentPreviewUrl(documentId: string) {
  const result = await unwrap<DocumentUrlResponse>(
    api.get(`/api/v1/documents/${encodeURIComponent(documentId)}/preview-url`),
  );
  return result.url;
}

export async function getDocumentDownloadUrl(documentId: string) {
  const result = await unwrap<DocumentUrlResponse>(
    api.get(`/api/v1/documents/${encodeURIComponent(documentId)}/download-url`),
  );
  return result.url;
}

export async function uploadDocumentBinary(input: {
  orderNumber: string;
  file: {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
  };
}) {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  const fileResponse = await fetch(input.file.uri);
  const blob = await fileResponse.blob();
  const query = new URLSearchParams({
    orderNumber: input.orderNumber,
    fileName: input.file.name,
    uploaderRole: 'notary',
    uploadedByName: 'Notary',
    ...(input.file.mimeType ? { mimeType: input.file.mimeType } : {}),
    ...(typeof input.file.size === 'number' ? { fileSize: String(input.file.size) } : {}),
  }).toString();

  const response = await fetch(`${api.defaults.baseURL}/api/v1/documents/upload?${query}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': input.file.mimeType || 'application/octet-stream',
    },
    body: blob,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorBody?.message || 'Document upload failed');
  }

  const payload = (await response.json()) as { data: BackendDocument };
  return normalizeDocument(payload.data);
}
