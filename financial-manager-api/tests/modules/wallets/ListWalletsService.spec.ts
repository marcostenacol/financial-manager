import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListWalletsService } from '@/modules/wallets/services/ListWalletsService';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('ListWalletsService', () => {
  let walletRepository: WalletRepositoryInterface;
  let cacheTrait: CacheTrait;
  let listWalletsService: ListWalletsService;

  beforeEach(() => {
    walletRepository = {
      findAllByUserId: vi.fn(),
    } as any;

    cacheTrait = {
      get: vi.fn(),
      set: vi.fn(),
    } as any;

    listWalletsService = new ListWalletsService(walletRepository, cacheTrait);
  });

  it('should list wallets from cache if available', async () => {
    const cachedWallets = [{ id: 'w1', name: 'Wallet 1' }];
    vi.spyOn(cacheTrait, 'get').mockResolvedValue(cachedWallets);

    const result = await listWalletsService.execute('user-id');

    expect(result).toEqual(cachedWallets);
    expect(walletRepository.findAllByUserId).not.toHaveBeenCalled();
  });

  it('should list wallets from repository if not in cache', async () => {
    const dbWallets = [{ id: 'w1', name: 'Wallet 1' }];
    vi.spyOn(cacheTrait, 'get').mockResolvedValue(null);
    vi.spyOn(walletRepository, 'findAllByUserId').mockResolvedValue(dbWallets as any);

    const result = await listWalletsService.execute('user-id');

    expect(result).toEqual(dbWallets);
    expect(cacheTrait.set).toHaveBeenCalled();
  });
});
