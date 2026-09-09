import { Prisma } from '@prisma/client';

export type InvoiceStatus = 'open' | 'closed' | 'partially_paid' | 'paid';

export function computeInvoiceStatus(
  totalAmount: Prisma.Decimal,
  paidAmount: Prisma.Decimal,
  closingDate: Date,
  now: Date = new Date(),
): InvoiceStatus {
  if (totalAmount.gt(0) && paidAmount.gte(totalAmount)) return 'paid';
  if (paidAmount.gt(0)) return 'partially_paid';
  return now >= closingDate ? 'closed' : 'open';
}
