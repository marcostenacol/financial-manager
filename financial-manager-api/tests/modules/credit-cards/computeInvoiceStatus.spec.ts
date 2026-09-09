import { describe, it, expect } from 'vitest';
import { Prisma } from '@prisma/client';
import { computeInvoiceStatus } from '@/modules/credit-cards/utils/computeInvoiceStatus';

describe('computeInvoiceStatus', () => {
  const closingDate = new Date('2026-08-05T00:00:00.000Z');

  it('is open before closing with no payment', () => {
    const now = new Date('2026-08-01T00:00:00.000Z');
    expect(computeInvoiceStatus(new Prisma.Decimal(100), new Prisma.Decimal(0), closingDate, now)).toBe('open');
  });

  it('is closed after closing with no payment', () => {
    const now = new Date('2026-08-10T00:00:00.000Z');
    expect(computeInvoiceStatus(new Prisma.Decimal(100), new Prisma.Decimal(0), closingDate, now)).toBe('closed');
  });

  it('is partially_paid when payments are below the total', () => {
    const now = new Date('2026-08-10T00:00:00.000Z');
    expect(computeInvoiceStatus(new Prisma.Decimal(100), new Prisma.Decimal(40), closingDate, now)).toBe('partially_paid');
  });

  it('is paid when payments reach or exceed the total', () => {
    const now = new Date('2026-08-10T00:00:00.000Z');
    expect(computeInvoiceStatus(new Prisma.Decimal(100), new Prisma.Decimal(100), closingDate, now)).toBe('paid');
    expect(computeInvoiceStatus(new Prisma.Decimal(100), new Prisma.Decimal(120), closingDate, now)).toBe('paid');
  });
});
