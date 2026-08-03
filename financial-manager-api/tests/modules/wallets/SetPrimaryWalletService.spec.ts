import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SetPrimaryWalletService } from '@/modules/wallets/services/SetPrimaryWalletService';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AppError } from '@/shared/errors/AppError';

describe('SetPrimaryWalletService', () => {
  let walletRepository: WalletRepositoryInterface;
  let cacheTrait: CacheTrait;
  let setPrimaryWalletService: SetPrimaryWalletService;

  beforeEach(() => {
    walletRepository = {
      findById: vi.fn(),
      findAllByUserId: vi.fn(),
      setPrimary: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
      delPattern: vi.fn(),
    } as any;

    setPrimaryWalletService = new SetPrimaryWalletService(walletRepository, cacheTrait);
  });

  it('should set wallet as primary and invalidate caches', async () => {
    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-2', userId: 'user-id', scope: 'personal' } as any);
    vi.spyOn(walletRepository, 'findAllByUserId').mockResolvedValue([
      { id: 'wallet-1', userId: 'user-id', isPrimary: true },
      { id: 'wallet-2', userId: 'user-id', isPrimary: false },
    ] as any);
    vi.spyOn(walletRepository, 'setPrimary').mockResolvedValue({ id: 'wallet-2', userId: 'user-id', isPrimary: true } as any);

    const result = await setPrimaryWalletService.execute('wallet-2', 'user-id');

    expect(result.isPrimary).toBe(true);
    expect(walletRepository.setPrimary).toHaveBeenCalledWith('wallet-2', 'user-id', 'personal');
    expect(cacheTrait.delPattern).toHaveBeenCalledWith('wallets:user:user-id:*');
    expect(cacheTrait.del).toHaveBeenCalledWith('wallet:detail:wallet-2');
    expect(cacheTrait.del).toHaveBeenCalledWith('wallet:detail:wallet-1');
  });

  it('should throw when wallet does not exist or belongs to another user', async () => {
    vi.spyOn(walletRepository, 'findById').mockResolvedValue(null);

    await expect(setPrimaryWalletService.execute('wallet-2', 'user-id')).rejects.toThrow(AppError);
    expect(walletRepository.setPrimary).not.toHaveBeenCalled();
  });
});
