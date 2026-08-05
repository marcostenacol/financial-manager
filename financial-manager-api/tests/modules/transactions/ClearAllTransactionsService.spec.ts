import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do Prisma antes dos imports que o utilizam
vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { ClearAllTransactionsService } from '@/modules/transactions/services/ClearAllTransactionsService';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('ClearAllTransactionsService', () => {
  let transactionRepository: TransactionRepositoryInterface;
  let walletRepository: WalletRepositoryInterface;
  let organizationMemberRepository: OrganizationMemberRepositoryInterface;
  let cacheTrait: CacheTrait;
  let clearAllTransactionsService: ClearAllTransactionsService;

  beforeEach(() => {
    transactionRepository = {
      deleteAllByUserId: vi.fn(),
      deleteAllByOrganizationId: vi.fn(),
    } as any;

    walletRepository = {
      findAllByUserId: vi.fn().mockResolvedValue([{ id: 'wallet-1' }, { id: 'wallet-2' }]),
      findAllByOrganizationId: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
    } as any;

    organizationMemberRepository = {
      findByOrganizationAndUser: vi.fn().mockResolvedValue({ id: 'member-1' }),
    } as any;

    cacheTrait = {
      del: vi.fn(),
      delPattern: vi.fn(),
    } as any;

    clearAllTransactionsService = new ClearAllTransactionsService(
      transactionRepository,
      walletRepository,
      organizationMemberRepository,
      cacheTrait,
    );
  });

  it('should delete all transactions without touching wallet balances by default', async () => {
    await clearAllTransactionsService.execute('user-1', false);

    expect(transactionRepository.deleteAllByUserId).toHaveBeenCalledWith('user-1', expect.anything());
    expect(walletRepository.update).not.toHaveBeenCalled();
  });

  it('should zero out every wallet balance when reset_balances is true', async () => {
    await clearAllTransactionsService.execute('user-1', true);

    expect(walletRepository.update).toHaveBeenCalledWith('wallet-1', { balance: 0 }, expect.anything());
    expect(walletRepository.update).toHaveBeenCalledWith('wallet-2', { balance: 0 }, expect.anything());
  });
});
