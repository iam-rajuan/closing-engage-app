import * as SecureStore from 'expo-secure-store';
import axios, { AxiosError, AxiosHeaders } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PREFIX = '/api/v1';

const normalizeBaseURL = (value: string) => {
  const trimmed = value.trim().replace(/\/+$/, '');
  return trimmed.endsWith(API_PREFIX) ? trimmed.slice(0, -API_PREFIX.length) : trimmed;
};

const debuggerHost = (Constants as unknown as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig?.debuggerHost;
const expoHost = debuggerHost ? debuggerHost.split(':')[0]?.trim() || undefined : undefined;

const resolveDevelopmentHost = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      if (Platform.OS === 'android') {
        parsed.hostname = '10.0.2.2';
      } else if (expoHost) {
        parsed.hostname = expoHost;
      }
    }

    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return url;
  }
};

const rawBaseURL = (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://localhost:5000';
const baseURL = resolveDevelopmentHost(normalizeBaseURL(rawBaseURL));

export const AUTH_TOKEN_KEY = 'closing_engage_token';
export const AUTH_USER_KEY = 'closing_engage_user';
export const AUTH_ONBOARDING_KEY = 'closing_engage_onboarding';

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export class ApiClientError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
  }
}

export const api = axios.create({
  baseURL,
  timeout: 20000,
});

// Mock Database definitions
const mockCompanyOrders = [
  { id: "ORD-92831", clientName: "Sarah Jenkins", notary: "Elena Rodriguez", propertyAddress: "742 Evergreen Terrace, Springfield", location: "Springfield", date: "Apr 15, 2026", time: "02:00 PM", status: "Received" as const, loanType: "Refinance", scanbacksRequired: true },
  { id: "ORD-92842", clientName: "Robert Chen", notary: "Elena Rodriguez", propertyAddress: "1200 Avenue of the Americas, NY", location: "New York, NY", date: "Apr 13, 2026", time: "10:30 AM", status: "Under Review" as const, loanType: "Purchase", scanbacksRequired: false },
  { id: "ORD-92710", clientName: "James Wilson", notary: "Sarah Jenkins", propertyAddress: "450 Market Street, San Francisco", location: "San Francisco, CA", date: "Apr 10, 2026", time: "04:00 PM", status: "Completed" as const, loanType: "Seller", scanbacksRequired: true }
];

const mockNotaryOrders = [
  { id: "CE-94012", clientName: "Jonathan Harker", propertyAddress: "123 Oak St, Austin, TX 78701", location: "Denver, CO", date: "Mar 22, 2026", time: "02:30 PM", status: "In Progress" as const, notary: "Elena Rodriguez", openForAll: false },
  { id: "CE-93881", clientName: "Arthur Manning", propertyAddress: "Aurora closing office", location: "Aurora, CO", date: "Mar 23, 2026", time: "09:00 AM", status: "Assigned" as const, notary: "Elena Rodriguez", openForAll: false },
  { id: "CE-93700", clientName: "Sarah Williams", propertyAddress: "Boulder escrow office", location: "Boulder, CO", date: "Mar 22, 2026", time: "11:15 AM", status: "Pending Upload" as const, notary: "Elena Rodriguez", openForAll: true }
];

const mockTeam = [
  { id: "t1", name: "John Doe", email: "john.doe@company.com", role: "Admin" as const, status: "Active" as const, joinedDate: "Oct 12, 2025" },
  { id: "t2", name: "Sarah Chen", email: "s.chen@company.com", role: "Member" as const, status: "Active" as const, joinedDate: "Nov 05, 2025" },
  { id: "t3", name: "Marcus Bell", email: "m.bell@company.com", role: "Member" as const, status: "Pending Invite" as const, joinedDate: "2 hours ago" }
];

const mockDocs = [
  { id: "d1", fileName: "Closing_Disclosure_Final.pdf", status: "Approved" as const, sizeLabel: "2.4 MB", uploadDate: "Mar 18, 2026", orderNumber: "ORD-92831", uploadedByName: "Elena Rodriguez (Notary)" },
  { id: "d2", fileName: "Title_Commitment_V2.pdf", status: "Approved" as const, sizeLabel: "1.8 MB", uploadDate: "Mar 15, 2026", orderNumber: "ORD-92842" },
  { id: "d3", fileName: "Home_Inspection_Report.pdf", status: "Approved" as const, sizeLabel: "5.2 MB", uploadDate: "Mar 10, 2026", orderNumber: "ORD-92710" }
];

const mockCredentials = {
  licenseNumber: "COMM-928103",
  commissionAuthority: "State of Colorado",
  commissionExpiry: "2028-12-31",
  eoCoverage: "$100,000",
  verified: true,
  backgroundScreeningStatus: "Verified" as const,
  backgroundScreeningDetail: "NNA background check completed on Mar 01, 2026.",
  credentials: [
    { id: "c1", documentName: "Notary_Commission_Certificate.pdf", issuer: "Secretary of State", uploadDate: "Mar 01, 2026", verification: "Auto-Verified" as const, status: "Approved" as const },
    { id: "c2", documentName: "EO_Insurance_Policy.pdf", issuer: "Merchants Bonding", uploadDate: "Mar 02, 2026", verification: "Manual Review" as const, status: "Approved" as const }
  ]
};

const mockMessages: Record<string, any[]> = {
  "ORD-92831": [
    { id: "m1", body: "Hello Elena, we just received the title update. Please review.", senderRole: "company", senderName: "Sarah Jenkins", createdAt: new Date().toISOString() }
  ],
  "CE-94012": [
    { id: "m1", body: "Hello Sarah, let me know when you sign.", senderRole: "company", senderName: "Sarah Jenkins", createdAt: new Date().toISOString() }
  ]
};

// Axios Custom Adapter for local offline usage
api.defaults.adapter = async (config) => {
  const url = config.url || '';
  const method = (config.method || 'GET').toUpperCase();
  const token = config.headers?.Authorization ? String(config.headers.Authorization) : '';
  const isNotary = token.includes('notary');

  let responseData: any = null;
  let status = 200;

  // Logger helper
  console.log(`[MOCK API] ${method} ${url} (Token type: ${isNotary ? 'Notary' : 'Company'})`);

  if (url.includes('/auth/portal/login')) {
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    const email = body?.email || '';
    const selectedRole = email.toLowerCase().includes('notary') ? 'notary' : 'company';

    if (selectedRole === 'notary') {
      responseData = {
        token: 'dummy.eyJyb2xlIjoibm90YXJ5In0.dummy',
        role: 'notary',
        redirectTo: '/notary/home',
        user: {
          id: 'n1',
          email,
          fullName: 'Elena Rodriguez',
          name: 'Elena Rodriguez',
          status: 'Active'
        }
      };
    } else {
      responseData = {
        token: 'dummy.eyJyb2xlIjoiY29tcGFueSJ9.dummy',
        role: 'company',
        redirectTo: '/company/home',
        user: {
          id: '1',
          email,
          companyName: 'Jenkins Signing Co',
          contactPerson: 'Sarah Jenkins',
          name: 'Sarah Jenkins',
          status: 'Active'
        }
      };
    }
  } else if (url.includes('/auth/company/me')) {
    responseData = {
      company: {
        id: '1',
        email: 'sarah.jenkins@company.com',
        companyName: 'Jenkins Signing Co',
        contactPerson: 'Sarah Jenkins',
        name: 'Sarah Jenkins',
        status: 'Active'
      }
    };
  } else if (url.includes('/auth/notary/me')) {
    responseData = {
      notary: {
        id: 'n1',
        email: 'elena.rodriguez@notary.com',
        fullName: 'Elena Rodriguez',
        name: 'Elena Rodriguez',
        status: 'Active'
      }
    };
  } else if (url === '/api/v1/orders' || url.endsWith('/orders')) {
    if (isNotary) {
      responseData = mockNotaryOrders;
    } else {
      responseData = mockCompanyOrders;
    }
  } else if (url.includes('/orders/')) {
    // Extract order id
    const match = url.match(/\/orders\/([^/]+)/);
    const orderId = match ? match[1] : '';

    if (url.endsWith('/timeline')) {
      responseData = [
        { title: "Received", date: "Mar 15, 09:00 AM", tone: "green" },
        { title: "Assigned", date: "Mar 15, 11:30 AM", tone: "green" },
        { title: "In Progress", date: "Mar 16, 02:15 PM", tone: "blue" }
      ];
    } else if (url.endsWith('/meeting/confirm')) {
      const order = mockNotaryOrders.find(o => o.id === orderId) || mockCompanyOrders.find(o => o.id === orderId);
      responseData = {
        id: orderId,
        clientName: order?.clientName || "Jonathan Harker",
        propertyAddress: order?.propertyAddress || "123 Oak St, Austin, TX",
        location: order?.location || "Denver, CO",
        signingDate: order?.date || "Mar 22, 2026",
        status: order?.status || "In Progress",
        assignedNotaryName: "Elena Rodriguez",
        assignedNotaryId: "n1",
        openForAll: order?.openForAll || false,
        meeting: { status: 'confirmed', date: 'Mar 22, 2026', time: '02:30 PM', confirmedByRole: 'notary' },
        documents: mockDocs.filter(d => d.orderNumber === orderId),
        timeline: [
          { title: "Received", date: "Mar 15, 09:00 AM", tone: "green" },
          { title: "Assigned", date: "Mar 15, 11:30 AM", tone: "green" }
        ]
      };
    } else if (url.endsWith('/meeting')) {
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const order = mockNotaryOrders.find(o => o.id === orderId) || mockCompanyOrders.find(o => o.id === orderId);
      responseData = {
        id: orderId,
        clientName: order?.clientName || "Jonathan Harker",
        propertyAddress: order?.propertyAddress || "123 Oak St, Austin, TX",
        location: order?.location || "Denver, CO",
        signingDate: body?.signingDate || "Mar 22, 2026",
        status: order?.status || "In Progress",
        assignedNotaryName: "Elena Rodriguez",
        assignedNotaryId: "n1",
        openForAll: order?.openForAll || false,
        meeting: { status: 'scheduled', date: body?.signingDate, time: body?.signingTime || 'TBD', scheduledByRole: 'notary' },
        documents: mockDocs.filter(d => d.orderNumber === orderId),
        timeline: [
          { title: "Received", date: "Mar 15, 09:00 AM", tone: "green" },
          { title: "Assigned", date: "Mar 15, 11:30 AM", tone: "green" }
        ]
      };
    } else if (url.endsWith('/printed-confirmation')) {
      const order = mockNotaryOrders.find(o => o.id === orderId) || mockCompanyOrders.find(o => o.id === orderId);
      responseData = {
        id: orderId,
        clientName: order?.clientName || "Jonathan Harker",
        propertyAddress: order?.propertyAddress || "123 Oak St, Austin, TX",
        location: order?.location || "Denver, CO",
        signingDate: order?.date || "Mar 22, 2026",
        status: order?.status || "In Progress",
        assignedNotaryName: "Elena Rodriguez",
        assignedNotaryId: "n1",
        openForAll: order?.openForAll || false,
        notaryPrintedConfirmed: true,
        documents: mockDocs.filter(d => d.orderNumber === orderId),
        timeline: [
          { title: "Received", date: "Mar 15, 09:00 AM", tone: "green" },
          { title: "Assigned", date: "Mar 15, 11:30 AM", tone: "green" }
        ]
      };
    } else if (url.endsWith('/notary-status')) {
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const order = mockNotaryOrders.find(o => o.id === orderId);
      if (order) order.status = body?.status;
      responseData = order || {};
    } else if (url.endsWith('/accept-open')) {
      const order = mockNotaryOrders.find(o => o.id === orderId) || mockCompanyOrders.find(o => o.id === orderId);
      if (order) {
        order.openForAll = false;
        order.status = 'Assigned';
      }
      responseData = {
        id: orderId,
        clientName: order?.clientName || "Jonathan Harker",
        propertyAddress: order?.propertyAddress || "123 Oak St, Austin, TX",
        location: order?.location || "Denver, CO",
        signingDate: order?.date || "Mar 22, 2026",
        status: "Assigned",
        assignedNotaryName: "Elena Rodriguez",
        assignedNotaryId: "n1",
        openForAll: false,
        documents: mockDocs.filter(d => d.orderNumber === orderId),
        timeline: [
          { title: "Received", date: "Mar 15, 09:00 AM", tone: "green" },
          { title: "Assigned", date: "Mar 15, 11:30 AM", tone: "green" }
        ]
      };
    } else {
      // General order details
      const order = mockNotaryOrders.find(o => o.id === orderId) || mockCompanyOrders.find(o => o.id === orderId);
      responseData = {
        id: orderId,
        clientName: order?.clientName || "Jonathan Harker",
        propertyAddress: order?.propertyAddress || "123 Oak St, Austin, TX",
        location: order?.location || "Denver, CO",
        signingDate: order?.date || "Mar 22, 2026",
        status: order?.status || "In Progress",
        assignedNotaryName: "Elena Rodriguez",
        assignedNotaryId: "n1",
        openForAll: order?.openForAll || false,
        documents: mockDocs.filter(d => d.orderNumber === orderId),
        timeline: [
          { title: "Received", date: "Mar 15, 09:00 AM", tone: "green" },
          { title: "Assigned", date: "Mar 15, 11:30 AM", tone: "green" },
          { title: "In Progress", date: "Mar 16, 02:15 PM", tone: "blue" }
        ]
      };
    }
  } else if (url.includes('/team')) {
    responseData = mockTeam;
  } else if (url.includes('/documents')) {
    responseData = mockDocs;
  } else if (url.includes('/notary/credentials')) {
    responseData = mockCredentials;
  } else if (url.includes('/messages')) {
    const match = url.match(/\/communications\/orders\/([^/]+)\/messages/);
    const orderId = match ? match[1] : '';
    const messages = mockMessages[orderId] || [];

    if (method === 'POST') {
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const newMsg = {
        id: 'msg-' + Math.random(),
        body: body?.body || '',
        senderRole: isNotary ? 'notary' : 'company',
        senderName: isNotary ? 'Elena Rodriguez' : 'Sarah Jenkins',
        createdAt: new Date().toISOString()
      };
      messages.push(newMsg);
      mockMessages[orderId] = messages;
      responseData = { message: newMsg };
    } else {
      responseData = {
        thread: {
          id: 'thread-' + orderId,
          orderNumber: orderId,
          companyId: 'c1',
          notaryId: 'n1',
          lastMessage: messages[messages.length - 1]?.body || '',
          lastMessageAt: messages[messages.length - 1]?.createdAt || new Date().toISOString(),
          unreadCount: 0
        },
        messages
      };
    }
  }

  // Wrap in standard Envelope
  const response: AxiosResponse = {
    data: {
      success: true,
      message: 'Success',
      data: responseData
    },
    status,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    config
  };

  return response;
};

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        (!axiosError.response && axiosError.message === 'Network Error'
          ? `Network Error. Mobile app could not reach ${baseURL}. Check that the backend is running and the emulator can access this host.`
          : undefined) ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Something went wrong while talking to the server';
      return Promise.reject(new ApiClientError(message, axiosError.response?.status));
    }

    return Promise.reject(new ApiClientError('Unexpected API error'));
  },
);

export const unwrap = async <T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> => {
  const response = await request;
  return response.data.data;
};

