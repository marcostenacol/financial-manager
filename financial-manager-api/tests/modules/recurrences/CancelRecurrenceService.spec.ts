import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CancelRecurrenceService } from '@/modules/recurrences/services/CancelRecurrenceService';
import { RecurrenceRepositoryInterface } from '@/modules/recurrences/repositories/contracts/RecurrenceRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AppError } from '@/shared/errors/AppError';

describe('CancelRecurrenceService', () => {
  let recurrenceRepository: RecurrenceRepositoryInterface;
  let cacheTrait: CacheTrait;
  let cancelRecurrenceService: CancelRecurrenceService;

  beforeEach(() => {
    recurrenceRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    cancelRecurrenceService = new CancelRecurrenceService(recurrenceRepository, cacheTrait);
  });

  it('should set endsAt and isActive false when cancelling', async () => {
    const recurrenceId = 'recurrence-1';
    const userId = 'user-1';
    const recurrence = { id: recurrenceId, isActive: true, endsAt: null, wallet: { userId } };

    vi.spyOn(recurrenceRepository, 'findById').mockResolvedValue(recurrence as any);
    vi.spyOn(recurrenceRepository, 'update').mockResolvedValue({ ...recurrence, isActive: false } as any);

    await cancelRecurrenceService.execute(recurrenceId, userId);

    expect(recurrenceRepository.update).toHaveBeenCalledWith(
      recurrenceId,
      expect.objectContaining({ isActive: false, endsAt: expect.any(Date) }),
    );
    expect(cacheTrait.del).toHaveBeenCalledWith(`recurrences:user:${userId}`);
  });

  it('should throw AppError when recurrence does not exist', async () => {
    vi.spyOn(recurrenceRepository, 'findById').mockResolvedValue(null);

    await expect(cancelRecurrenceService.execute('missing', 'user-1')).rejects.toThrow(AppError);
  });

  it('should throw AppError when recurrence belongs to another user', async () => {
    const recurrence = { id: 'recurrence-1', wallet: { userId: 'other-user' } };
    vi.spyOn(recurrenceRepository, 'findById').mockResolvedValue(recurrence as any);

    await expect(cancelRecurrenceService.execute('recurrence-1', 'user-1')).rejects.toThrow(AppError);
    expect(recurrenceRepository.update).not.toHaveBeenCalled();
  });
});
