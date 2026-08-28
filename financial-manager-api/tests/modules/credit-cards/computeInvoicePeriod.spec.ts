import { describe, it, expect } from 'vitest';
import { computeInvoicePeriod, addMonthsClamped } from '@/modules/credit-cards/utils/computeInvoicePeriod';

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

describe('addMonthsClamped', () => {
  it('clamps a month-end date to the shorter target month instead of overflowing', () => {
    const result = addMonthsClamped(new Date('2026-01-31T00:00:00.000Z'), 1);
    expect(result.toISOString().slice(0, 10)).toBe('2026-02-28');
  });

  it('adds months normally when there is no overflow', () => {
    const result = addMonthsClamped(new Date('2026-01-15T00:00:00.000Z'), 2);
    expect(result.toISOString().slice(0, 10)).toBe('2026-03-15');
  });

  it('rolls the year over when months push past December', () => {
    const result = addMonthsClamped(new Date('2026-11-30T00:00:00.000Z'), 2);
    expect(result.toISOString().slice(0, 10)).toBe('2027-01-30');
  });
});
