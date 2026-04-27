import { Credential } from '@/types/credential';
import { DocumentFile } from '@/types/document';
import { Message } from '@/types/message';
import { Order, TimelineStep } from '@/types/order';
import { TeamMember } from '@/types/team';

export const companyStats = [
  { label: 'Total Orders', value: '1,248' },
  { label: 'Active Orders', value: '342' },
  { label: 'Pending Review', value: '56' },
  { label: 'Completed', value: '850' },
];

export const pipeline = [
  { label: 'Received', value: 100 },
  { label: 'Assigned', value: 85 },
  { label: 'Under Review', value: 60 },
  { label: 'Approved', value: 45 },
  { label: 'Completed', value: 30 },
];

export const companyOrders: Order[] = [
  {
    id: '1',
    orderNumber: '#ORD-92831',
    clientName: 'Sarah Jenkins',
    notaryName: 'Elena Rodriguez',
    address: '742 Evergreen Terrace, Springfield',
    location: 'Springfield',
    signingDate: 'Apr 15, 2026',
    status: 'Received',
    instructions: 'Client requested a bilingual notary if possible.',
  },
  {
    id: '2',
    orderNumber: '#ORD-92842',
    clientName: 'Robert Chen',
    notaryName: 'Elena Rodriguez',
    address: '1200 Avenue of the Americas, NY',
    location: 'New York, NY',
    signingDate: 'Apr 13, 2026',
    status: 'Under Review',
  },
  {
    id: '3',
    orderNumber: '#ORD-92710',
    clientName: 'James Wilson',
    notaryName: 'Sarah Jenkins',
    address: '450 Market Street, San Francisco',
    location: 'San Francisco, CA',
    signingDate: 'Apr 10, 2026',
    status: 'Completed',
  },
];

export const notaryOrders: Order[] = [
  {
    id: 'n1',
    orderNumber: '#CE-94012',
    clientName: 'Jonathan Harker',
    address: '123 Oak St, Austin, TX 78701',
    location: 'Denver, CO',
    signingDate: 'Mar 22, 02:30 PM',
    status: 'In Progress',
  },
  {
    id: 'n2',
    orderNumber: '#CE-93881',
    clientName: 'Arthur Manning',
    address: 'Aurora closing office',
    location: 'Aurora, CO',
    signingDate: 'Mar 23, 09:00 AM',
    status: 'Assigned',
  },
  {
    id: 'n3',
    orderNumber: '#CE-93700',
    clientName: 'Sarah Williams',
    address: 'Boulder escrow office',
    location: 'Boulder, CO',
    signingDate: 'Mar 22, 11:15 AM',
    status: 'Pending Upload',
  },
];

export const documents: DocumentFile[] = [
  {
    id: 'd1',
    name: 'Closing_Disclosure_Final.pdf',
    orderId: 'ORD-99281',
    status: 'Approved',
    uploadedDate: 'Mar 18, 2026',
    size: '2.4 MB',
    uploadedBy: 'Janet Doe (Notary)',
  },
  {
    id: 'd2',
    name: 'Title_Commitment_V2.pdf',
    orderId: 'ORD-99150',
    status: 'Approved',
    uploadedDate: 'Mar 15, 2026',
    size: '1.8 MB',
  },
  {
    id: 'd3',
    name: 'Home_Inspection_Report.pdf',
    orderId: 'ORD-98842',
    status: 'Approved',
    uploadedDate: 'Mar 10, 2026',
    size: '5.2 MB',
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: 't1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Admin',
    joinedLabel: 'Oct 12, 2025',
    status: 'Active',
    avatar: 'JD',
  },
  {
    id: 't2',
    name: 'Sarah Chen',
    email: 's.chen@company.com',
    role: 'Member',
    joinedLabel: 'Nov 05, 2025',
    status: 'Active',
    avatar: 'SC',
  },
  {
    id: 't3',
    name: 'Marcus Bell',
    email: 'm.bell@company.com',
    role: 'Member',
    joinedLabel: '2 hours ago',
    status: 'Pending Invite',
    avatar: 'MB',
  },
];

export const orderTimeline: TimelineStep[] = [
  { label: 'Received', time: 'Mar 15, 09:00 AM', done: true },
  { label: 'Assigned', time: 'Mar 15, 11:30 AM', done: true },
  { label: 'Under Review', time: 'Mar 16, 02:15 PM', done: true },
  { label: 'Approved', time: 'In Progress', done: false },
  { label: 'Completed', time: 'Pending', done: false },
];

export const messages: Message[] = [
  {
    id: 'm1',
    author: 'admin',
    time: '09:15 AM',
    body: 'Hello Sarah, we just received the title update for #CE-90210. Please review the updated closing instructions before you head out.',
  },
  {
    id: 'm2',
    author: 'me',
    time: '09:22 AM',
    body: "Thanks for the update! I see the changes. I'll make sure to double-check the signature blocks.",
  },
  {
    id: 'm3',
    author: 'admin',
    time: '09:45 AM',
    body: 'Perfect. Let us know once the signing is complete.',
  },
];

export const credentials: Credential[] = [
  { id: 'c1', title: 'NNA Certification', issuer: 'National Notary Association', date: 'Apr 20, 2024', status: 'Approved' },
  { id: 'c2', title: 'Identity Verification', issuer: 'Stripe Identity Services', date: 'Mar 15, 2024', status: 'Approved' },
  { id: 'c3', title: 'Expired Bond 2022', issuer: 'Merchants Bonding Co.', date: 'Jan 10, 2022', status: 'Archived' },
];
