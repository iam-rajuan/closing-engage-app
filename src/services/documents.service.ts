import { api, unwrap } from '@/services/api';
import { DocumentFile } from '@/types/document';
import * as FileSystem from 'expo-file-system/legacy';
import { getAuthToken } from '@/services/api';

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
  uploaderRole?: DocumentFile['uploaderRole'];
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
  uploaderRole: input.uploaderRole,
  mimeType: input.mimeType,
  comments: input.comments,
});

const base64ToBytes = (value: string) => {
  const binary = globalThis.atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

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

export async function deleteDocument(documentId: string) {
  await unwrap(api.delete(`/api/v1/documents/${encodeURIComponent(documentId)}`));
}

export async function resubmitDocument(documentId: string) {
  const result = await unwrap<BackendDocument>(
    api.post(`/api/v1/documents/${encodeURIComponent(documentId)}/resubmit`),
  );
  return normalizeDocument(result);
}

export async function uploadDocumentBinary(input: {
  orderNumber: string;
  file: {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
  };
  uploaderRole?: string;
  uploadedByName?: string;
}) {
  const token = await getAuthToken();
  const base64Content = await FileSystem.readAsStringAsync(input.file.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const fileBytes = base64ToBytes(base64Content);
  const query = new URLSearchParams({
    orderNumber: input.orderNumber,
    fileName: input.file.name,
    uploaderRole: input.uploaderRole || 'notary',
    uploadedByName: input.uploadedByName || 'Notary',
    ...(input.file.mimeType ? { mimeType: input.file.mimeType } : {}),
    ...(typeof input.file.size === 'number' ? { fileSize: String(input.file.size) } : {}),
  }).toString();

  const response = await fetch(`${api.defaults.baseURL}/api/v1/documents/upload?${query}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': input.file.mimeType || 'application/octet-stream',
    },
    body: fileBytes,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorBody?.message || 'Document upload failed');
  }

  const payload = (await response.json()) as { data: BackendDocument };
  return normalizeDocument(payload.data);
}
