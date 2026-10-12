import { describe, it, expect } from 'vitest';
import { Prisma } from '@prisma/client';
import { personDebtOf } from '@/modules/transactions/utils/personDebt';

describe('personDebtOf', () => {
  const base = { type: 'expense', status: 'completed', personId: 'person-1', amount: 80 };

  it('counts a completed expense linked to a person', () => {
    expect(personDebtOf(base)).toEqual(new Prisma.Decimal(80));
  });

  it('counts a pending expense linked to a person', () => {
    expect(personDebtOf({ ...base, status: 'pending' })).toEqual(new Prisma.Decimal(80));
  });

  it('ignores a cancelled expense', () => {
    expect(personDebtOf({ ...base, status: 'cancelled' }).isZero()).toBe(true);
  });

  it('ignores an expense without person', () => {
    expect(personDebtOf({ ...base, personId: null }).isZero()).toBe(true);
  });

  it('ignores income', () => {
    expect(personDebtOf({ ...base, type: 'income' }).isZero()).toBe(true);
  });
});
