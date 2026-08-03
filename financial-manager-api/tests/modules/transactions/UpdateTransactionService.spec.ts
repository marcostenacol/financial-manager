import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do Prisma antes dos imports que o utilizam
vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { Prisma } from '@prisma/client';
import { UpdateTransactionService } from '@/modules/transactions/services/UpdateTransactionService';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CategoryRepositoryInterface } from '@/modules/categories/repositories/contracts/CategoryRepositoryInterface';
import { CostCenterRepositoryInterface } from '@/modules/cost-centers/repositories/contracts/CostCenterRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { TransactionTypeEnum } from '@/modules/transactions/enums/TransactionTypeEnum';
import { TransactionStatusEnum } from '@/modules/transactions/enums/TransactionStatusEnum';
import { AppError } from '@/shared/errors/AppError';

describe('UpdateTransactionService', () => {
  let transactionRepository: TransactionRepositoryInterface;
  let walletRepository: WalletRepositoryInterface;
  let categoryRepository: CategoryRepositoryInterface;
  let costCenterRepository: CostCenterRepositoryInterface;
  let cacheTrait: CacheTrait;
  let updateTransactionService: UpdateTransactionService;

  beforeEach(() => {
    transactionRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;

    walletRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;

    categoryRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'category-1', scope: null }),
    } as any;

    costCenterRepository = {
      findById: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
      delPattern: vi.fn(),
    } as any;

    updateTransactionService = new UpdateTransactionService(
      transactionRepository,
      walletRepository,
      categoryRepository,
      costCenterRepository,
      cacheTrait,
    );
  });

  it('should apply only the net delta when changing the amount of a completed expense', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const wallet = { id: walletId, userId, balance: 500 };
    const existingTransaction = {
      id: 'tx-1',
      walletId,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.COMPLETED,
      amount: 100,
    };

    vi.spyOn(transactionRepository, 'findById').mockResolvedValue(existingTransaction as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue(wallet as any);
    vi.spyOn(transactionRepository, 'update').mockResolvedValue({
      ...existingTransaction,
      amount: 150,
    } as any);

    await updateTransactionService.execute('tx-1', { amount: 150 } as any, userId);

    // delta líquido: -150 (novo impacto) - (-100 (impacto antigo)) = -50
    expect(walletRepository.update).toHaveBeenCalledWith(
      walletId,
      { balance: { increment: new Prisma.Decimal(-50) } },
      expect.anything(),
    );
  });

  it('should apply the full new impact when transaction was pending and becomes completed', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const wallet = { id: walletId, userId, balance: 500 };
    const existingTransaction = {
      id: 'tx-1',
      walletId,
      type: TransactionTypeEnum.INCOME,
      status: TransactionStatusEnum.PENDING,
      amount: 200,
    };

    vi.spyOn(transactionRepository, 'findById').mockResolvedValue(existingTransaction as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue(wallet as any);
    vi.spyOn(transactionRepository, 'update').mockResolvedValue({
      ...existingTransaction,
      status: TransactionStatusEnum.COMPLETED,
    } as any);

    await updateTransactionService.execute('tx-1', { status: TransactionStatusEnum.COMPLETED } as any, userId);

    expect(walletRepository.update).toHaveBeenCalledWith(
      walletId,
      { balance: { increment: new Prisma.Decimal(200) } },
      expect.anything(),
    );
  });

  it('should not touch the wallet balance when nothing relevant changes and delta is zero', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const wallet = { id: walletId, userId, balance: 500 };
    const existingTransaction = {
      id: 'tx-1',
      walletId,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.PENDING,
      amount: 100,
    };

    vi.spyOn(transactionRepository, 'findById').mockResolvedValue(existingTransaction as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue(wallet as any);
    vi.spyOn(transactionRepository, 'update').mockResolvedValue({
      ...existingTransaction,
      description: 'nova descrição',
    } as any);

    await updateTransactionService.execute('tx-1', { description: 'nova descrição' } as any, userId);

    expect(walletRepository.update).not.toHaveBeenCalled();
  });

  it('should throw when the wallet does not belong to the authenticated user', async () => {
    const walletId = 'wallet-1';
    const existingTransaction = {
      id: 'tx-1',
      walletId,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.COMPLETED,
      amount: 100,
    };

    vi.spyOn(transactionRepository, 'findById').mockResolvedValue(existingTransaction as any);
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId: 'other-user', balance: 500 } as any);

    await expect(
      updateTransactionService.execute('tx-1', { amount: 50 } as any, 'user-1'),
    ).rejects.toThrow(AppError);
  });
});
