import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DetailProfileService } from '@/modules/profile/services/DetailProfileService';
import { ProfileRepositoryInterface } from '@/modules/profile/repositories/contracts/ProfileRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AppError } from '@/shared/errors/AppError';

describe('DetailProfileService', () => {
  let profileRepository: ProfileRepositoryInterface;
  let cacheTrait: CacheTrait;
  let detailProfileService: DetailProfileService;

  beforeEach(() => {
    profileRepository = {
      findByUserId: vi.fn(),
    } as any;

    cacheTrait = {
      get: vi.fn(),
      set: vi.fn(),
    } as any;

    detailProfileService = new DetailProfileService(profileRepository, cacheTrait);
  });

  it('should return profile from cache if available', async () => {
    const cachedProfile = { id: 'profile-id', userId: 'user-id', name: 'Cached Name' };
    vi.spyOn(cacheTrait, 'get').mockResolvedValue(cachedProfile);

    const result = await detailProfileService.execute('user-id');

    expect(result).toEqual(cachedProfile);
    expect(profileRepository.findByUserId).not.toHaveBeenCalled();
  });

  it('should return profile from repository and save to cache if not in cache', async () => {
    const dbProfile = { id: 'profile-id', userId: 'user-id', name: 'DB Name' };
    vi.spyOn(cacheTrait, 'get').mockResolvedValue(null);
    vi.spyOn(profileRepository, 'findByUserId').mockResolvedValue(dbProfile as any);

    const result = await detailProfileService.execute('user-id');

    expect(result).toEqual(dbProfile);
    expect(cacheTrait.set).toHaveBeenCalled();
  });

  it('should throw error if profile not found', async () => {
    vi.spyOn(cacheTrait, 'get').mockResolvedValue(null);
    vi.spyOn(profileRepository, 'findByUserId').mockResolvedValue(null);

    await expect(detailProfileService.execute('user-id')).rejects.toBeInstanceOf(AppError);
  });
});
