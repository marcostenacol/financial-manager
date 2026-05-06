import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateProfileService } from '@/modules/profile/services/UpdateProfileService';
import { ProfileRepositoryInterface } from '@/modules/profile/repositories/contracts/ProfileRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('UpdateProfileService', () => {
  let profileRepository: ProfileRepositoryInterface;
  let cacheTrait: CacheTrait;
  let updateProfileService: UpdateProfileService;

  beforeEach(() => {
    profileRepository = {
      update: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    updateProfileService = new UpdateProfileService(profileRepository, cacheTrait);
  });

  it('should update profile and invalidate cache', async () => {
    const updateData = { user_id: 'user-id', name: 'New Name' };
    vi.spyOn(profileRepository, 'update').mockResolvedValue({ id: 'p1', ...updateData } as any);

    const result = await updateProfileService.execute(updateData);

    expect(result.name).toBe('New Name');
    expect(cacheTrait.del).toHaveBeenCalledWith('profile:user:user-id');
  });
});
