import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['company', 'notary']),
});

export const orderSchema = z.object({
  title: z.string().min(2, 'Order title is required'),
  clientName: z.string().min(2, 'Client name is required'),
  propertyAddress: z.string().min(5, 'Property address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(5, 'Zip is required'),
  signingDate: z.string().min(1, 'Signing date is required'),
  loanType: z.string().min(1, 'Loan type is required'),
  requirements: z.string().optional(),
  preferredNotary: z.string().optional(),
  instructions: z.string().optional(),
});

export const memberSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  email: z.string().email('Enter a valid email address'),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type OrderForm = z.infer<typeof orderSchema>;
export type MemberForm = z.infer<typeof memberSchema>;
