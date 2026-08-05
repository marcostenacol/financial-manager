import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do Prisma antes dos imports que o utilizam
vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { ClearAllRecurrencesService } from '@/modules/recurrences/services/ClearAllRecurrencesService';
import { RecurrenceRepositoryInterface } from '@/modules/recurrences/repositories/contracts/RecurrenceRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('ClearAllRecurrencesService', () => {
  let recurrenceRepository: RecurrenceRepositoryInterface;
  let transactionRepository: TransactionRepositoryInterface;
  let organizationMemberRepository: OrganizationMemberRepositoryInterface;
  let cacheTrait: CacheTrait;
  let clearAllRecurrencesService: ClearAllRecurrencesService;

  beforeEach(() => {
    recurrenceRepository = {
      deleteAllByUserId: vi.fn(),
      deleteAllByOrganizationId: vi.fn(),
    } as any;

    transactionRepository = {
      nullifyRecurrenceForUser: vi.fn(),
      nullifyRecurrenceForOrganization: vi.fn(),
    } as any;

    organizationMemberRepository = {
      findByOrganizationAndUser: vi.fn().mockResolvedValue({ id: 'member-1' }),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    clearAllRecurrencesService = new ClearAllRecurrencesService(
      recurrenceRepository,
      transactionRepository,
      organizationMemberRepository,
      cacheTrait,
    );
  });

  it('should unlink transactions before deleting recurrences, preserving transaction history', async () => {
    await clearAllRecurrencesService.execute('user-1');

    expect(transactionRepository.nullifyRecurrenceForUser).toHaveBeenCalledWith('user-1', expect.anything());
    expect(recurrenceRepository.deleteAllByUserId).toHaveBeenCalledWith('user-1', expect.anything());
    expect(cacheTrait.del).toHaveBeenCalledWith('recurrences:user:user-1');
  });
});
