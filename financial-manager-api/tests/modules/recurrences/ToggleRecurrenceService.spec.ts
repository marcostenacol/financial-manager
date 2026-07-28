import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToggleRecurrenceService } from '@/modules/recurrences/services/ToggleRecurrenceService';
import { RecurrenceRepositoryInterface } from '@/modules/recurrences/repositories/contracts/RecurrenceRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AppError } from '@/shared/errors/AppError';

describe('ToggleRecurrenceService', () => {
  let recurrenceRepository: RecurrenceRepositoryInterface;
  let cacheTrait: CacheTrait;
  let toggleRecurrenceService: ToggleRecurrenceService;

  beforeEach(() => {
    recurrenceRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    toggleRecurrenceService = new ToggleRecurrenceService(recurrenceRepository, cacheTrait);
  });

  it('should flip isActive from true to false', async () => {
    const recurrenceId = 'recurrence-1';
    const userId = 'user-1';
    const recurrence = { id: recurrenceId, isActive: true, wallet: { userId } };

    vi.spyOn(recurrenceRepository, 'findById').mockResolvedValue(recurrence as any);
    vi.spyOn(recurrenceRepository, 'update').mockResolvedValue({ ...recurrence, isActive: false } as any);

    await toggleRecurrenceService.execute(recurrenceId, userId);

    expect(recurrenceRepository.update).toHaveBeenCalledWith(recurrenceId, { isActive: false });
    expect(cacheTrait.del).toHaveBeenCalledWith(`recurrences:user:${userId}`);
  });

  it('should flip isActive from false to true', async () => {
    const recurrenceId = 'recurrence-1';
    const userId = 'user-1';
    const recurrence = { id: recurrenceId, isActive: false, wallet: { userId } };

    vi.spyOn(recurrenceRepository, 'findById').mockResolvedValue(recurrence as any);
    vi.spyOn(recurrenceRepository, 'update').mockResolvedValue({ ...recurrence, isActive: true } as any);

    await toggleRecurrenceService.execute(recurrenceId, userId);

    expect(recurrenceRepository.update).toHaveBeenCalledWith(recurrenceId, { isActive: true });
  });

  it('should throw AppError when recurrence does not exist', async () => {
    vi.spyOn(recurrenceRepository, 'findById').mockResolvedValue(null);

    await expect(toggleRecurrenceService.execute('missing', 'user-1')).rejects.toThrow(AppError);
  });

  it('should throw AppError when recurrence belongs to another user', async () => {
    const recurrence = { id: 'recurrence-1', isActive: true, wallet: { userId: 'other-user' } };
    vi.spyOn(recurrenceRepository, 'findById').mockResolvedValue(recurrence as any);

    await expect(toggleRecurrenceService.execute('recurrence-1', 'user-1')).rejects.toThrow(AppError);
    expect(recurrenceRepository.update).not.toHaveBeenCalled();
  });
});
