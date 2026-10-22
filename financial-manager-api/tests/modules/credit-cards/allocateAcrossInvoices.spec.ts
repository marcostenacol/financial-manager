import { describe, it, expect } from 'vitest';
import { Prisma } from '@prisma/client';
import { allocateAcrossInvoices, pickDefaultStartInvoice } from '@/modules/credit-cards/utils/allocateAcrossInvoices';

const invoices = [
  { id: 'inv-oct', referenceMonth: '2026-10', remainingAmount: 800 },
  { id: 'inv-sep', referenceMonth: '2026-09', remainingAmount: 400 },
  { id: 'inv-nov', referenceMonth: '2026-11', remainingAmount: 300 },
];

const toPlain = (allocations: ReturnType<typeof allocateAcrossInvoices>) =>
  allocations.map((a) => ({ invoiceId: a.invoiceId, amount: a.amount.toNumber() }));

describe('allocateAcrossInvoices', () => {
  it('fills the starting invoice first and carries the rest to the next one in order', () => {
    const result = allocateAcrossInvoices(new Prisma.Decimal(1000), invoices, 'inv-sep');

    expect(toPlain(result)).toEqual([
      { invoiceId: 'inv-sep', amount: 400 },
      { invoiceId: 'inv-oct', amount: 600 },
    ]);
  });

  it('keeps everything on one invoice when it covers the whole amount', () => {
    const result = allocateAcrossInvoices(new Prisma.Decimal(300), invoices, 'inv-sep');

    expect(toPlain(result)).toEqual([{ invoiceId: 'inv-sep', amount: 300 }]);
  });

  it('ignores invoices older than the selected one', () => {
    const result = allocateAcrossInvoices(new Prisma.Decimal(500), invoices, 'inv-oct');

    expect(toPlain(result)).toEqual([{ invoiceId: 'inv-oct', amount: 500 }]);
  });

  it('skips invoices that have nothing pending', () => {
    const withSettled = [
      { id: 'inv-sep', referenceMonth: '2026-09', remainingAmount: 400 },
      { id: 'inv-oct', referenceMonth: '2026-10', remainingAmount: 0 },
      { id: 'inv-nov', referenceMonth: '2026-11', remainingAmount: -50 },
      { id: 'inv-dec', referenceMonth: '2026-12', remainingAmount: 200 },
    ];

    const result = allocateAcrossInvoices(new Prisma.Decimal(500), withSettled, 'inv-sep');

    expect(toPlain(result)).toEqual([
      { invoiceId: 'inv-sep', amount: 400 },
      { invoiceId: 'inv-dec', amount: 100 },
    ]);
  });

  it('puts the leftover on the last used invoice when the pending balances run out', () => {
    const result = allocateAcrossInvoices(new Prisma.Decimal(2000), invoices, 'inv-sep');

    expect(toPlain(result)).toEqual([
      { invoiceId: 'inv-sep', amount: 400 },
      { invoiceId: 'inv-oct', amount: 800 },
      { invoiceId: 'inv-nov', amount: 800 },
    ]);
  });

  it('puts everything on the selected invoice when none has a pending balance', () => {
    const settled = [
      { id: 'inv-sep', referenceMonth: '2026-09', remainingAmount: 0 },
      { id: 'inv-oct', referenceMonth: '2026-10', remainingAmount: 0 },
    ];

    const result = allocateAcrossInvoices(new Prisma.Decimal(150), settled, 'inv-oct');

    expect(toPlain(result)).toEqual([{ invoiceId: 'inv-oct', amount: 150 }]);
  });

  it('reports the reference month of each allocation', () => {
    const result = allocateAcrossInvoices(new Prisma.Decimal(1000), invoices, 'inv-sep');

    expect(result.map((a) => a.referenceMonth)).toEqual(['2026-09', '2026-10']);
  });

  it('throws when the selected invoice is not in the list', () => {
    expect(() => allocateAcrossInvoices(new Prisma.Decimal(100), invoices, 'missing')).toThrow();
  });
});

describe('pickDefaultStartInvoice', () => {
  it('returns the oldest invoice with a pending balance', () => {
    expect(pickDefaultStartInvoice(invoices)?.id).toBe('inv-sep');
  });

  it('skips settled invoices', () => {
    const list = [
      { id: 'inv-sep', referenceMonth: '2026-09', remainingAmount: 0 },
      { id: 'inv-oct', referenceMonth: '2026-10', remainingAmount: 120 },
    ];

    expect(pickDefaultStartInvoice(list)?.id).toBe('inv-oct');
  });

  it('returns undefined when nothing is pending', () => {
    expect(pickDefaultStartInvoice([{ id: 'inv-sep', referenceMonth: '2026-09', remainingAmount: 0 }])).toBeUndefined();
  });
});
