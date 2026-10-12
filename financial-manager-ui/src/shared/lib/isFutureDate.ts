import { toLocalDateInput } from './localDate';

export function isFutureDate(dateStr: string): boolean {
  return dateStr > toLocalDateInput();
}
