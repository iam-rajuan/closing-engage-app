import { api, unwrap } from '@/services/api';
import { Message } from '@/types/message';

type BackendMessage = {
  id: string;
  body: string;
  senderRole: 'admin' | 'company' | 'notary';
  senderName: string;
  createdAt: string;
};

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

const normalizeMessage = (message: BackendMessage, currentRole: 'company' | 'notary'): Message => ({
  id: message.id,
  author: message.senderRole === currentRole ? 'me' : 'admin',
  body: message.body,
  time: timeLabel(message.createdAt),
  senderName: message.senderName,
});

export async function getOrderMessages(orderNumber: string, currentRole: 'company' | 'notary') {
  const result = await unwrap<{ messages: BackendMessage[] }>(
    api.get(`/api/v1/communications/orders/${encodeURIComponent(orderNumber)}/messages`),
  );

  return result.messages.map((message) => normalizeMessage(message, currentRole));
}

export async function sendOrderMessage(orderNumber: string, body: string, currentRole: 'company' | 'notary') {
  const result = await unwrap<{ message: BackendMessage }>(
    api.post(`/api/v1/communications/orders/${encodeURIComponent(orderNumber)}/messages`, { body }),
  );

  return normalizeMessage(result.message, currentRole);
}
