import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateRecurrenceService } from '@/modules/recurrences/services/CreateRecurrenceService';
import { RecurrenceRepositoryInterface } from '@/modules/recurrences/repositories/contracts/RecurrenceRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('CreateRecurrenceService', () => {
  let recurrenceRepository: RecurrenceRepositoryInterface;
  let walletRepository: WalletRepositoryInterface;
  let cacheTrait: CacheTrait;
  let createRecurrenceService: CreateRecurrenceService;

  beforeEach(() => {
    recurrenceRepository = {
      create: vi.fn(),
    } as any;

    walletRepository = {
      findById: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    createRecurrenceService = new CreateRecurrenceService(recurrenceRepository, walletRepository, cacheTrait);
  });

  it('should create a new recurrence and clear cache', async () => {
    const userId = 'user-1';
    const walletId = 'wallet-1';
    const data = {
      description: 'Netflix',
      amount: 50,
      type: 'expense' as const,
      wallet_id: walletId,
      category_id: 'cat-1',
      period: 'monthly' as const,
      starts_at: '2024-05-01T00:00:00Z',
    };

    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: walletId, userId } as any);
    vi.spyOn(recurrenceRepository, 'create').mockResolvedValue({ id: 'rec-1', ...data } as any);

    const result = await createRecurrenceService.execute(data, userId);

    expect(result).toHaveProperty('id');
    expect(cacheTrait.del).toHaveBeenCalledWith(`recurrences:user:${userId}`);
  });

  it('should throw error if wallet does not belong to user', async () => {
    const userId = 'user-1';
    const data = {
      wallet_id: 'wallet-other',
      description: 'Test',
      amount: 10,
      type: 'expense' as const,
      category_id: 'cat-1',
      period: 'monthly' as const,
      starts_at: '2024-05-01T00:00:00Z',
    };

    vi.spyOn(walletRepository, 'findById').mockResolvedValue({ id: 'wallet-other', userId: 'other-user' } as any);

    await expect(createRecurrenceService.execute(data, userId)).rejects.toThrow('Carteira não encontrada ou acesso negado');
  });
});
