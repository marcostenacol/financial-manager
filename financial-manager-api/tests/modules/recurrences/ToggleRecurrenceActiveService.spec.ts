import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToggleRecurrenceActiveService } from '@/modules/recurrences/services/ToggleRecurrenceActiveService';
import { RecurrenceRepositoryInterface } from '@/modules/recurrences/repositories/contracts/RecurrenceRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AppError } from '@/shared/errors/AppError';

describe('ToggleRecurrenceActiveService', () => {
  let recurrenceRepository: RecurrenceRepositoryInterface;
  let cacheTrait: CacheTrait;
  let toggleRecurrenceActiveService: ToggleRecurrenceActiveService;

  beforeEach(() => {
    recurrenceRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    toggleRecurrenceActiveService = new ToggleRecurrenceActiveService(
      recurrenceRepository,
      cacheTrait
    );
  });

  it('should toggle recurrence isActive status', async () => {
    const userId = 'user-1';
    const recurrence = {
      id: 'rec-1',
      isActive: true,
    };

    vi.spyOn(recurrenceRepository, 'findById').mockResolvedValue(recurrence as any);
    vi.spyOn(recurrenceRepository, 'update').mockResolvedValue({ ...recurrence, isActive: false } as any);

    const result = await toggleRecurrenceActiveService.execute('rec-1', userId);

    expect(result.isActive).toBe(false);
    expect(recurrenceRepository.update).toHaveBeenCalledWith('rec-1', { isActive: false });
    expect(cacheTrait.del).toHaveBeenCalledWith(`recurrences:user:${userId}`);
  });

  it('should throw error if recurrence not found', async () => {
    vi.spyOn(recurrenceRepository, 'findById').mockResolvedValue(null);

    await expect(
      toggleRecurrenceActiveService.execute('non-existing', 'user-1')
    ).rejects.toBeInstanceOf(AppError);
  });
});
