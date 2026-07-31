import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateTransactionService } from '@/modules/transactions/services/CreateTransactionService';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { TransactionTypeEnum } from '@/modules/transactions/enums/TransactionTypeEnum';
import { TransactionStatusEnum } from '@/modules/transactions/enums/TransactionStatusEnum';
import { Prisma } from '@prisma/client';

describe('CreateTransactionService', () => {
  let transactionRepository: TransactionRepositoryInterface;
  let walletRepository: WalletRepositoryInterface;
  let cacheTrait: CacheTrait;
  let createTransactionService: CreateTransactionService;

  beforeEach(() => {
    transactionRepository = {
      create: vi.fn(),
    } as any;

    walletRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
      delPattern: vi.fn(),
    } as any;

    createTransactionService = new CreateTransactionService(transactionRepository, walletRepository, cacheTrait);
  });

  it('should create a transaction and update wallet balance for income', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'Salário',
      amount: 1000,
      type: TransactionTypeEnum.INCOME,
      status: TransactionStatusEnum.COMPLETED,
      wallet_id: walletId,
      occurred_at: '2024-05-01',
    };

    const wallet = { id: walletId, userId, balance: 500 };
    vi.spyOn(walletRepository, 'findById').mockResolvedValue(wallet as any);
    vi.spyOn(transactionRepository, 'create').mockResolvedValue({ id: 'tx-1', ...data, amount: 1000 } as any);

    const result = await createTransactionService.execute(data as any, userId);

    expect(result).toHaveProperty('id');
    expect(walletRepository.update).toHaveBeenCalledWith(walletId, { balance: new Prisma.Decimal(1500) });
    expect(cacheTrait.del).toHaveBeenCalled();
  });

  it('should create a transaction and update wallet balance for expense', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'Aluguel',
      amount: 200,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.COMPLETED,
      wallet_id: walletId,
      occurred_at: '2024-05-01',
    };

    const wallet = { id: walletId, userId, balance: 500 };
    vi.spyOn(walletRepository, 'findById').mockResolvedValue(wallet as any);
    vi.spyOn(transactionRepository, 'create').mockResolvedValue({ id: 'tx-2', ...data, amount: 200 } as any);

    const result = await createTransactionService.execute(data as any, userId);

    expect(result).toHaveProperty('id');
    expect(walletRepository.update).toHaveBeenCalledWith(walletId, { balance: new Prisma.Decimal(300) });
  });

  it('should not update balance if status is pending', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'Compra Pendente',
      amount: 100,
      type: TransactionTypeEnum.EXPENSE,
      status: TransactionStatusEnum.PENDING,
      wallet_id: walletId,
      occurred_at: '2024-05-01',
    };

    const wallet = { id: walletId, userId, balance: 500 };
    vi.spyOn(walletRepository, 'findById').mockResolvedValue(wallet as any);
    vi.spyOn(transactionRepository, 'create').mockResolvedValue({ id: 'tx-3', ...data, amount: 100 } as any);

    await createTransactionService.execute(data as any, userId);

    expect(walletRepository.update).not.toHaveBeenCalled();
  });
});
