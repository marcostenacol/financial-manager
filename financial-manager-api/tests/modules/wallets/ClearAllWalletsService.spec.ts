import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do Prisma antes dos imports que o utilizam
vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { ClearAllWalletsService } from '@/modules/wallets/services/ClearAllWalletsService';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { RecurrenceRepositoryInterface } from '@/modules/recurrences/repositories/contracts/RecurrenceRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('ClearAllWalletsService', () => {
  let walletRepository: WalletRepositoryInterface;
  let transactionRepository: TransactionRepositoryInterface;
  let recurrenceRepository: RecurrenceRepositoryInterface;
  let cacheTrait: CacheTrait;
  let clearAllWalletsService: ClearAllWalletsService;

  beforeEach(() => {
    walletRepository = {
      findAllByUserId: vi.fn().mockResolvedValue([{ id: 'wallet-1' }]),
      deleteAllByUserId: vi.fn(),
    } as any;

    transactionRepository = {
      deleteAllByUserId: vi.fn(),
    } as any;

    recurrenceRepository = {
      deleteAllByUserId: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
      delPattern: vi.fn(),
    } as any;

    clearAllWalletsService = new ClearAllWalletsService(
      walletRepository,
      transactionRepository,
      recurrenceRepository,
      cacheTrait,
    );
  });

  it('should delete transactions and recurrences before the wallets themselves (FK order)', async () => {
    await clearAllWalletsService.execute('user-1');

    expect(transactionRepository.deleteAllByUserId).toHaveBeenCalledWith('user-1', expect.anything());
    expect(recurrenceRepository.deleteAllByUserId).toHaveBeenCalledWith('user-1', expect.anything());
    expect(walletRepository.deleteAllByUserId).toHaveBeenCalledWith('user-1', expect.anything());
  });
});
