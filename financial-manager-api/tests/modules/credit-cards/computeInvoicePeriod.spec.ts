import { describe, it, expect } from 'vitest';
import { computeInvoicePeriod } from '@/modules/credit-cards/utils/computeInvoicePeriod';

describe('computeInvoicePeriod', () => {
  it('keeps the purchase in the current month when the day is before closing', () => {
    const result = computeInvoicePeriod(new Date('2026-08-03T12:00:00.000Z'), 5, 10);
    expect(result.referenceMonth).toBe('2026-08');
    expect(result.closingDate.toISOString().slice(0, 10)).toBe('2026-08-05');
    expect(result.dueDate.toISOString().slice(0, 10)).toBe('2026-08-10');
  });

  it('rolls over to the next month when the day is after closing', () => {
    const result = computeInvoicePeriod(new Date('2026-08-06T12:00:00.000Z'), 5, 10);
    expect(result.referenceMonth).toBe('2026-09');
    expect(result.closingDate.toISOString().slice(0, 10)).toBe('2026-09-05');
  });

  it('rolls over the year when the purchase is in December', () => {
    const result = computeInvoicePeriod(new Date('2026-12-10T12:00:00.000Z'), 5, 10);
    expect(result.referenceMonth).toBe('2027-01');
  });

  it('clamps a closing/due day beyond the month length', () => {
    const result = computeInvoicePeriod(new Date('2026-02-01T12:00:00.000Z'), 31, 31);
    expect(result.closingDate.toISOString().slice(0, 10)).toBe('2026-02-28');
    expect(result.dueDate.toISOString().slice(0, 10)).toBe('2026-02-28');
  });
});
