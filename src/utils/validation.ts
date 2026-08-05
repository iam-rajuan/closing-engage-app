import { z } from 'zod';

export const allowedLoanTypes = ['Refinance', 'Purchase', 'HELOC', 'Other'] as const;

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email or username'),
  password: z.string().trim().min(1, 'Enter your password'),
  role: z.enum(['company', 'notary']).optional(),
});

export const orderSchema = z.object({
  title: z.string().min(2, 'Order title is required'),
  clientName: z.string().min(2, 'Client name is required'),
  propertyAddress: z.string().min(5, 'Property address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(5, 'Zip is required'),
  signingDate: z.string().min(1, 'Signing date is required'),
  signingTime: z.string().optional(),
  price: z.string().optional(),
  loanType: z.enum(allowedLoanTypes, { message: 'Select a valid loan type' }),
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
