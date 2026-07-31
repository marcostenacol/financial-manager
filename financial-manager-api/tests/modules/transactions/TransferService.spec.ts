import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransferService } from '@/modules/transactions/services/TransferService';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

// Mock do Prisma antes dos imports que o utilizam
vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({
      transaction: { create: vi.fn() },
      wallet: { update: vi.fn() },
    })),
  },
}));

import { prisma } from '@/shared/database/PrismaClient';

describe('TransferService', () => {
  let transactionRepository: TransactionRepositoryInterface;
  let walletRepository: WalletRepositoryInterface;
  let cacheTrait: CacheTrait;
  let transferService: TransferService;

  beforeEach(() => {
    transactionRepository = {} as any;
    walletRepository = {
      findById: vi.fn(),
    } as any;
    cacheTrait = {
      del: vi.fn(),
      delPattern: vi.fn(),
    } as any;

    transferService = new TransferService(transactionRepository, walletRepository, cacheTrait);
  });

  it('should execute an atomic transfer between wallets', async () => {
    const userId = 'user-1';
    const data = {
      source_wallet_id: 'wallet-src',
      destination_wallet_id: 'wallet-dst',
      amount: 100,
      description: 'Transfer test',
      category_id: 'cat-1',
    };

    const sourceWallet = { id: 'wallet-src', userId, name: 'Origem', balance: 500 };
    const destinationWallet = { id: 'wallet-dst', userId, name: 'Destino', balance: 200 };
 
    vi.spyOn(walletRepository, 'findById')
      .mockResolvedValueOnce(sourceWallet as any)
      .mockResolvedValueOnce(destinationWallet as any);

    const txMock = {
      transaction: { create: vi.fn().mockResolvedValue({}) },
      wallet: { update: vi.fn().mockResolvedValue({}) },
    };

    vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
      return callback(txMock);
    });

    await transferService.execute(data, userId);

    expect(txMock.transaction.create).toHaveBeenCalledTimes(2);
    expect(txMock.wallet.update).toHaveBeenCalledTimes(2);
    expect(cacheTrait.del).toHaveBeenCalled();
  });

  it('should throw error if source wallet does not belong to user', async () => {
    const userId = 'user-1';
    const data = {
      source_wallet_id: 'wallet-other',
      destination_wallet_id: 'wallet-dst',
      amount: 100,
      description: 'Test',
      category_id: 'cat-1',
    };

    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-other', userId: 'other-user' } as any);

    await expect(transferService.execute(data, userId)).rejects.toThrow('Carteira de origem não encontrada ou acesso negado');
  });
});
