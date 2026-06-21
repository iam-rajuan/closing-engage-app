import { api, unwrap } from '@/services/api';
import { Order, OrderDocumentSummary, TimelineStep } from '@/types/order';

type BackendMeeting = {
  status: 'scheduled' | 'confirmed';
  date: string;
  time: string;
  scheduledByRole?: 'admin' | 'company' | 'notary';
  confirmedByRole?: 'admin' | 'company' | 'notary';
  scheduledAt?: string;
  confirmedAt?: string;
} | null;

type BackendOrderListItem = {
  id: string;
  clientName: string;
  companyName?: string;
  companyAvatarUrl?: string;
  propertyAddress: string;
  location: string;
  notary: string;
  notaryAvatarUrl?: string;
  status: Order['status'];
  date: string;
  time: string;
  loanType?: string;
  scanbacksRequired?: boolean;
  preferredNotaryName?: string;
  notaryPrintedConfirmed?: boolean;
  openForAll?: boolean;
  meeting?: BackendMeeting;
};

type BackendOrderDetail = {
  id: string;
  title?: string;
  clientName: string;
  companyName?: string;
  companyAvatarUrl?: string;
  signerName?: string;
  signerPhone?: string;
  propertyAddress: string;
  location: string;
  signingDate: string;
  signingTime: string;
  date: string;
  time: string;
  status: Order['status'];
  priority?: string;
  loanType?: string;
  specialInstructions?: string;
  preferredNotaryName?: string;
  notaryPrintedConfirmed?: boolean;
  assignedNotaryName?: string;
  assignedNotaryId?: string;
  openForAll?: boolean;
  notaryAvatarUrl?: string;
  meeting?: BackendMeeting;
  documents: OrderDocumentSummary[];
  timeline: Array<{ title: string; date: string; tone: string }>;
  createdDate?: string;
};

type CreateOrderInput = {
  title: string;
  clientName: string;
  propertyAddress: string;
  city: string;
  state: string;
  zip: string;
  signingDate: string;
  signingTime?: string;
  loanType: string;
  preferredNotary?: string;
  instructions?: string;
  scanbacksRequired: boolean;
  priority: 'Standard' | 'Rush';
};

const normalizeOrderNumber = (value: string) => (value.startsWith('#') ? value : `#${value}`);

const toTimelineSteps = (
  timeline: Array<{ title: string; date: string; tone: string }>,
  currentStatus: Order['status'],
): TimelineStep[] => {
  const canonicalStatuses: Order['status'][] = [
    'Received',
    'Assigned',
    'Under Review',
    'Approved',
    'Completed',
  ];

  return canonicalStatuses.map((status) => {
    const event = timeline.find((entry) => entry.title.toLowerCase().includes(status.toLowerCase()));
    const currentIndex = canonicalStatuses.indexOf(currentStatus);
    const statusIndex = canonicalStatuses.indexOf(status);
    return {
      label: status,
      time: event?.date ?? (statusIndex <= currentIndex ? 'Completed' : 'Pending'),
      done: statusIndex <= currentIndex || Boolean(event),
    };
  });
};

export const normalizeOrderListItem = (item: BackendOrderListItem): Order => ({
  id: item.id,
  orderNumber: normalizeOrderNumber(item.id),
  clientName: item.clientName,
  companyName: item.companyName,
  companyAvatarUrl: item.companyAvatarUrl,
  notaryName: item.notary && item.notary !== '--' && item.notary !== 'Open for All' ? item.notary : undefined,
  notaryAvatarUrl: item.notaryAvatarUrl,
  address: item.propertyAddress,
  location: item.location,
  signingDate: item.date,
  signingTime: item.time,
  status: item.status,
  loanType: item.loanType,
  scanbacksRequired: item.scanbacksRequired,
  preferredNotaryName: item.preferredNotaryName,
  notaryPrintedConfirmed: item.notaryPrintedConfirmed,
  openForAll: item.openForAll ?? false,
  meeting: item.meeting ?? null,
});

export const normalizeOrderDetail = (detail: BackendOrderDetail): Order & { timelineSteps: TimelineStep[] } => ({
  id: detail.id,
  orderNumber: normalizeOrderNumber(detail.id),
  clientName: detail.clientName,
  companyName: detail.companyName,
  companyAvatarUrl: detail.companyAvatarUrl,
  notaryName:
    detail.assignedNotaryName && detail.assignedNotaryName !== '--' && detail.assignedNotaryName !== 'Open for All'
      ? detail.assignedNotaryName
      : undefined,
  notaryAvatarUrl: detail.notaryAvatarUrl,
  address: detail.propertyAddress,
  location: detail.location,
  signingDate: detail.signingDate || detail.date,
  signingTime: detail.signingTime || detail.time,
  status: detail.status,
  priority: detail.priority === 'Rush' ? 'Urgent' : 'Normal',
  instructions: detail.specialInstructions,
  title: detail.title,
  signerName: detail.signerName,
  signerPhone: detail.signerPhone,
  loanType: detail.loanType,
  preferredNotaryName: detail.preferredNotaryName,
  notaryPrintedConfirmed: detail.notaryPrintedConfirmed,
  assignedNotaryId: detail.assignedNotaryId,
  openForAll: detail.openForAll ?? false,
  meeting: detail.meeting ?? null,
  documents: detail.documents,
  timeline: detail.timeline.map((event) => ({
    title: event.title,
    date: event.date,
    tone: event.tone as 'blue' | 'slate' | 'green' | 'red',
  })),
  createdDate: detail.createdDate,
  timelineSteps: toTimelineSteps(detail.timeline, detail.status),
});

export async function getCompanyOrders() {
  const result = await unwrap<BackendOrderListItem[]>(api.get('/api/v1/orders'));
  return result.map(normalizeOrderListItem);
}

export async function getNotaryOrders() {
  const result = await unwrap<BackendOrderListItem[]>(api.get('/api/v1/orders'));
  return result.map(normalizeOrderListItem);
}

export async function getOrderById(orderId: string) {
  const result = await unwrap<BackendOrderDetail>(api.get(`/api/v1/orders/${encodeURIComponent(orderId)}`));
  return normalizeOrderDetail(result);
}

export async function getOrderTimeline(orderId: string) {
  const result = await unwrap<Array<{ title: string; date: string; tone: string }>>(
    api.get(`/api/v1/orders/${encodeURIComponent(orderId)}/timeline`),
  );
  return result;
}

export async function createOrder(payload: CreateOrderInput) {
  const result = await unwrap<BackendOrderListItem>(
    api.post('/api/v1/orders', {
      title: payload.title,
      clientName: payload.clientName,
      propertyAddress: payload.propertyAddress,
      city: payload.city,
      state: payload.state,
      zip: payload.zip,
      signingDate: payload.signingDate,
      signingTime: payload.signingTime || 'TBD',
      loanType: payload.loanType,
      preferredNotary: payload.preferredNotary,
      instructions: payload.instructions,
      scanbacksRequired: payload.scanbacksRequired,
      priority: payload.priority,
    }),
  );

  return normalizeOrderListItem(result);
}

export async function scheduleOrderMeeting(orderId: string, signingDate: string, signingTime: string) {
  const result = await unwrap<BackendOrderDetail>(
    api.patch(`/api/v1/orders/${encodeURIComponent(orderId)}/meeting`, {
      signingDate,
      signingTime,
    }),
  );
  return normalizeOrderDetail(result);
}

export async function confirmOrderMeeting(orderId: string) {
  const result = await unwrap<BackendOrderDetail>(
    api.patch(`/api/v1/orders/${encodeURIComponent(orderId)}/meeting/confirm`),
  );
  return normalizeOrderDetail(result);
}

export async function confirmPrintedDocuments(orderId: string) {
  const result = await unwrap<BackendOrderDetail>(
    api.patch(`/api/v1/orders/${encodeURIComponent(orderId)}/printed-confirmation`),
  );
  return normalizeOrderDetail(result);
}

export async function updateNotaryOrderStatus(orderId: string, status: Order['status']) {
  const result = await unwrap<BackendOrderListItem>(
    api.patch(`/api/v1/orders/${encodeURIComponent(orderId)}/notary-status`, { status }),
  );
  return normalizeOrderListItem(result);
}

export async function acceptOpenOrder(orderId: string) {
  const result = await unwrap<BackendOrderDetail | BackendOrderListItem>(
    api.patch(`/api/v1/orders/${encodeURIComponent(orderId)}/accept-open`),
  );

  if ('timeline' in result) {
    return normalizeOrderDetail(result);
  }

  return normalizeOrderListItem(result);
}
