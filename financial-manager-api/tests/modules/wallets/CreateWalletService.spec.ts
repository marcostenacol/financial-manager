import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateWalletService } from '@/modules/wallets/services/CreateWalletService';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('CreateWalletService', () => {
  let walletRepository: WalletRepositoryInterface;
  let cacheTrait: CacheTrait;
  let createWalletService: CreateWalletService;

  beforeEach(() => {
    walletRepository = {
      create: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    createWalletService = new CreateWalletService(walletRepository, cacheTrait);
  });

  it('should create a new wallet and clear cache', async () => {
    const walletData = {
      name: 'Main Wallet',
      type: 'personal',
      balance: 100,
    };
    const userId = 'user-id';

    vi.spyOn(walletRepository, 'create').mockResolvedValue({
      id: 'wallet-id',
      userId,
      ...walletData,
    } as any);

    const result = await createWalletService.execute({ ...walletData, user_id: userId } as any);

    expect(result).toHaveProperty('id');
    expect(result.name).toBe(walletData.name);
    expect(cacheTrait.del).toHaveBeenCalledWith(`wallets:user:${userId}`);
  });
});
