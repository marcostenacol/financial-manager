import { Prisma } from '@prisma/client';

export interface AllocatableInvoice {
  id: string;
  referenceMonth: string;
  remainingAmount: number;
}

export interface InvoiceAllocation {
  invoiceId: string;
  referenceMonth: string;
  amount: Prisma.Decimal;
}

function sortByReferenceMonth(invoices: AllocatableInvoice[]): AllocatableInvoice[] {
  return [...invoices].sort((a, b) => a.referenceMonth.localeCompare(b.referenceMonth));
}

export function pickDefaultStartInvoice(invoices: AllocatableInvoice[]): AllocatableInvoice | undefined {
  return sortByReferenceMonth(invoices).find((invoice) => invoice.remainingAmount > 0);
}

export function allocateAcrossInvoices(
  amount: Prisma.Decimal,
  invoices: AllocatableInvoice[],
  startInvoiceId: string,
): InvoiceAllocation[] {
  const sorted = sortByReferenceMonth(invoices);
  const startIndex = sorted.findIndex((invoice) => invoice.id === startInvoiceId);

  if (startIndex === -1) {
    throw new Error('Fatura inicial não encontrada na lista de faturas');
  }

  const allocations: InvoiceAllocation[] = [];
  let left = amount;

  for (const invoice of sorted.slice(startIndex)) {
    if (left.lessThanOrEqualTo(0)) break;

    const pending = new Prisma.Decimal(invoice.remainingAmount);
    if (pending.lessThanOrEqualTo(0)) continue;

    const portion = Prisma.Decimal.min(left, pending);
    allocations.push({ invoiceId: invoice.id, referenceMonth: invoice.referenceMonth, amount: portion });
    left = left.minus(portion);
  }

  if (left.greaterThan(0)) {
    const target = allocations.length > 0 ? allocations[allocations.length - 1] : undefined;

    if (target) {
      target.amount = target.amount.plus(left);
    } else {
      const start = sorted[startIndex];
      allocations.push({ invoiceId: start.id, referenceMonth: start.referenceMonth, amount: left });
    }
  }

  return allocations;
}
