import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterService } from '@/modules/auth/services/RegisterService';
import { AuthRepositoryInterface } from '@/modules/auth/repositories/contracts/AuthRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { hash } from 'bcrypt';

describe('RegisterService', () => {
  let authRepository: AuthRepositoryInterface;
  let registerService: RegisterService;

  beforeEach(() => {
    authRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findRoleBySlug: vi.fn(),
      createRefreshToken: vi.fn(),
      findRefreshToken: vi.fn(),
      invalidateRefreshToken: vi.fn(),
    } as any;

    registerService = new RegisterService(authRepository);
  });

  it('should be able to register a new user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      type: 'personal' as const,
    };

    vi.spyOn(authRepository, 'findByEmail').mockResolvedValue(null);
    vi.spyOn(authRepository, 'findRoleBySlug').mockResolvedValue({ id: 'role-id', name: 'User', slug: 'user' } as any);
    vi.spyOn(authRepository, 'create').mockResolvedValue({
      id: 'user-id',
      ...userData,
      password: 'hashed-password',
      roleId: 'role-id',
    } as any);

    const user = await registerService.execute(userData);

    expect(user).toHaveProperty('id');
    expect(user.email).toBe(userData.email);
    expect(user).not.toHaveProperty('password');
  });

  it('should not be able to register a user with an existing email', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      type: 'personal' as const,
    };

    vi.spyOn(authRepository, 'findByEmail').mockResolvedValue({ id: 'existing-id' } as any);

    await expect(registerService.execute(userData)).rejects.toBeInstanceOf(AppError);
  });
});
