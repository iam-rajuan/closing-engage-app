import { format, parseISO } from 'date-fns';

export function formatDate(value: string) {
  const date = value.includes('T') ? parseISO(value) : new Date(value);
  return Number.isNaN(date.getTime()) ? value : format(date, 'MMM d, yyyy');
}
