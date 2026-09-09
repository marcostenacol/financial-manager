import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateWalletService } from '@/modules/wallets/services/UpdateWalletService';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('UpdateWalletService', () => {
  let walletRepository: WalletRepositoryInterface;
  let cacheTrait: CacheTrait;
  let updateWalletService: UpdateWalletService;

  beforeEach(() => {
    walletRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
      delPattern: vi.fn(),
    } as any;

    updateWalletService = new UpdateWalletService(walletRepository, cacheTrait);
  });

  it('updates closing_day and due_day for a credit wallet', async () => {
    const walletId = 'wallet-1';
    const userId = 'user-1';

    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId, organizationId: null, type: 'credit' } as any);
    vi.spyOn(walletRepository, 'update').mockResolvedValue({ id: walletId, closingDay: 5, dueDay: 10 } as any);

    await updateWalletService.execute({ id: walletId, user_id: userId, closing_day: 5, due_day: 10 } as any);

    expect(walletRepository.update).toHaveBeenCalledWith(
      walletId,
      expect.objectContaining({ closingDay: 5, dueDay: 10 }),
    );
  });
});
