import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginService } from '@/modules/auth/services/LoginService';
import { AuthRepositoryInterface } from '@/modules/auth/repositories/contracts/AuthRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AppError } from '@/shared/errors/AppError';
import { compare, hash } from 'bcrypt';
import { FastifyInstance } from 'fastify';

vi.mock('bcrypt', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

describe('LoginService', () => {
  let authRepository: AuthRepositoryInterface;
  let cacheTrait: CacheTrait;
  let fastify: FastifyInstance;
  let loginService: LoginService;

  beforeEach(() => {
    authRepository = {
      findByEmail: vi.fn(),
      createRefreshToken: vi.fn(),
    } as any;

    cacheTrait = {
      set: vi.fn(),
    } as any;

    fastify = {
      jwt: {
        sign: vi.fn().mockReturnValue('fake-token'),
      },
    } as any;

    loginService = new LoginService(authRepository, cacheTrait, fastify);
  });

  it('should be able to authenticate', async () => {
    const credentials = {
      email: 'john@example.com',
      password: 'password123',
    };

    const hashedPassword = 'hashed-password';
    vi.mocked(hash).mockResolvedValue(hashedPassword as never);

    vi.spyOn(authRepository, 'findByEmail').mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      email: credentials.email,
      password: hashedPassword,
    } as any);

    vi.spyOn(authRepository, 'createRefreshToken').mockResolvedValue({
      token: 'refresh-token',
    } as any);

    vi.mocked(compare).mockResolvedValue(true as never);

    const response = await loginService.execute(credentials);

    expect(response).toHaveProperty('token');
    expect(response).toHaveProperty('refresh_token');
    expect(response.user.email).toBe(credentials.email);
  });

  it('should not be able to authenticate with wrong password', async () => {
    const credentials = {
      email: 'john@example.com',
      password: 'wrong-password',
    };

    vi.spyOn(authRepository, 'findByEmail').mockResolvedValue({
      id: 'user-id',
      email: credentials.email,
      password: 'hashed-password',
    } as any);

    vi.mocked(compare).mockResolvedValue(false as never);

    await expect(loginService.execute(credentials)).rejects.toBeInstanceOf(AppError);
  });
});
