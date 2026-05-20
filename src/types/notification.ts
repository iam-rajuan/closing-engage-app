export type NotificationType = 'order' | 'document' | 'user';

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: NotificationType;
  linkId?: string;
  recipientRole?: 'admin' | 'company' | 'notary';
};
