import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do Prisma antes dos imports que o utilizam
vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { Prisma } from '@prisma/client';
import { DeleteTransactionService } from '@/modules/transactions/services/DeleteTransactionService';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { TransactionTypeEnum } from '@/modules/transactions/enums/TransactionTypeEnum';
import { TransactionStatusEnum } from '@/modules/transactions/enums/TransactionStatusEnum';
import { AppError } from '@/shared/errors/AppError';

describe('DeleteTransactionService', () => {
  let transactionRepository: TransactionRepositoryInterface;
  let walletRepository: WalletRepositoryInterface;
  let cacheTrait: CacheTrait;
  let deleteTransactionService: DeleteTransactionService;

  beforeEach(() => {
    transactionRepository = {
      findById: vi.fn(),
      delete: vi.fn(),
    } as any;

    walletRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
      delPattern: vi.fn(),
    } as any;

    deleteTransactionService = new DeleteTransactionService(transactionRepository, walletRepository, cacheTrait);
  });

  it('should revert the wallet balance when deleting a completed expense', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const transaction = {
      id: 'tx-1',
      walletId,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.COMPLETED,
      amount: 100,
    };

    vi.spyOn(transactionRepository, 'findById').mockResolvedValue(transaction as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId, balance: 400 } as any);

    await deleteTransactionService.execute('tx-1', userId);

    expect(walletRepository.update).toHaveBeenCalledWith(
      walletId,
      { balance: { increment: new Prisma.Decimal(100) } },
      expect.anything(),
    );
    expect(transactionRepository.delete).toHaveBeenCalledWith('tx-1', expect.anything());
  });

  it('should revert the wallet balance when deleting a completed income', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const transaction = {
      id: 'tx-1',
      walletId,
      type: TransactionTypeEnum.INCOME,
      status: TransactionStatusEnum.COMPLETED,
      amount: 300,
    };

    vi.spyOn(transactionRepository, 'findById').mockResolvedValue(transaction as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId, balance: 1000 } as any);

    await deleteTransactionService.execute('tx-1', userId);

    expect(walletRepository.update).toHaveBeenCalledWith(
      walletId,
      { balance: { increment: new Prisma.Decimal(-300) } },
      expect.anything(),
    );
  });

  it('should not touch the wallet balance when deleting a pending transaction', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const transaction = {
      id: 'tx-1',
      walletId,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.PENDING,
      amount: 100,
    };

    vi.spyOn(transactionRepository, 'findById').mockResolvedValue(transaction as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId, balance: 400 } as any);

    await deleteTransactionService.execute('tx-1', userId);

    expect(walletRepository.update).not.toHaveBeenCalled();
    expect(transactionRepository.delete).toHaveBeenCalledWith('tx-1', expect.anything());
  });

  it('should throw when the wallet does not belong to the authenticated user', async () => {
    const walletId = 'wallet-1';
    const transaction = {
      id: 'tx-1',
      walletId,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.COMPLETED,
      amount: 100,
    };

    vi.spyOn(transactionRepository, 'findById').mockResolvedValue(transaction as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId: 'other-user', balance: 400 } as any);

    await expect(deleteTransactionService.execute('tx-1', 'user-1')).rejects.toThrow(AppError);
    expect(transactionRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw when the transaction does not exist', async () => {
    vi.spyOn(transactionRepository, 'findById').mockResolvedValue(null);

    await expect(deleteTransactionService.execute('tx-missing', 'user-1')).rejects.toThrow(AppError);
  });
});
