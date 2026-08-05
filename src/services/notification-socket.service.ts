import { io, type Socket } from 'socket.io-client';
import { getApiBaseURL, getAuthToken } from '@/services/api';
import { NotificationItem } from '@/types/notification';

type NotificationServerEvents = {
  'notifications:new': (payload: NotificationItem) => void;
  'notifications:read': (payload: { id: string }) => void;
  'notifications:read-all': () => void;
  'notifications:deleted': (payload: { id: string }) => void;
  'notifications:cleared': () => void;
};

type NotificationClientEvents = Record<string, never>;

export type NotificationSocket = Socket<NotificationServerEvents, NotificationClientEvents>;

const getSocketBaseURL = () => getApiBaseURL().replace(/\/api\/v\d+$/, '');

export async function createNotificationSocket() {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  return io(getSocketBaseURL(), {
    auth: { token },
    autoConnect: false,
    transports: ['websocket', 'polling'],
  });
}
