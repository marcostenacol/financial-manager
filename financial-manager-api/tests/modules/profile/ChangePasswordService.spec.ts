import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hash } from 'bcrypt';
import { ChangePasswordService } from '@/modules/profile/services/ChangePasswordService';
import { AuthRepositoryInterface } from '@/modules/auth/repositories/contracts/AuthRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

describe('ChangePasswordService', () => {
  let authRepository: AuthRepositoryInterface;
  let cacheTrait: CacheTrait;
  let changePasswordService: ChangePasswordService;

  beforeEach(() => {
    authRepository = {
      findById: vi.fn(),
      updatePassword: vi.fn(),
      deleteAllUserRefreshTokens: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
    } as any;

    changePasswordService = new ChangePasswordService(authRepository, cacheTrait);
  });

  it('should update password when current password matches', async () => {
    const hashed_current = await hash('current-password', 10);
    vi.spyOn(authRepository, 'findById').mockResolvedValue({ id: 'user-id', password: hashed_current } as any);

    await changePasswordService.execute({
      user_id: 'user-id',
      current_password: 'current-password',
      new_password: 'new-password',
    });

    expect(authRepository.updatePassword).toHaveBeenCalledWith('user-id', expect.any(String));
    expect(authRepository.deleteAllUserRefreshTokens).toHaveBeenCalledWith('user-id');
    expect(cacheTrait.del).toHaveBeenCalledWith(CacheKeys.auth.token('user-id'));
  });

  it('should throw when user is not found', async () => {
    vi.spyOn(authRepository, 'findById').mockResolvedValue(null);

    await expect(
      changePasswordService.execute({
        user_id: 'user-id',
        current_password: 'current-password',
        new_password: 'new-password',
      }),
    ).rejects.toThrow(AppError);
  });

  it('should throw when current password does not match', async () => {
    const hashed_current = await hash('current-password', 10);
    vi.spyOn(authRepository, 'findById').mockResolvedValue({ id: 'user-id', password: hashed_current } as any);

    await expect(
      changePasswordService.execute({
        user_id: 'user-id',
        current_password: 'wrong-password',
        new_password: 'new-password',
      }),
    ).rejects.toThrow(AppError);

    expect(authRepository.updatePassword).not.toHaveBeenCalled();
  });
});
