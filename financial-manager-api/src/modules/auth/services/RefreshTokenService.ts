import { injectable, inject } from 'tsyringe';
import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { AuthRepositoryInterface } from '../repositories/contracts/AuthRepositoryInterface';
import { parseDurationToMs } from '@/shared/lib/parseDuration';

interface RefreshTokenResponse {
  token: string;
  refresh_token: string;
}

@injectable()
export class RefreshTokenService {
  constructor(
    @inject('AuthRepository')
    private auth_repository: AuthRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
    @inject('Fastify')
    private fastify: FastifyInstance,
  ) {}

  async execute(token: string): Promise<RefreshTokenResponse> {
    const refresh_token_exists = await this.auth_repository.findRefreshToken(token);

    if (!refresh_token_exists) {
      throw new AppError('Refresh token inválido', 401);
    }

    if (refresh_token_exists.expiresAt < new Date()) {
      await this.auth_repository.deleteRefreshToken(token);
      throw new AppError('Refresh token expirado', 401);
    }

    const user_id = refresh_token_exists.userId;
    const user = await this.auth_repository.findByIdWithRole(user_id);

    if (!user) {
      throw new AppError('Usuário não encontrado', 401);
    }

    const access_token_expires_in = process.env.JWT_EXPIRES_IN as string;
    const refresh_token_expires_in_ms = parseDurationToMs(process.env.JWT_REFRESH_EXPIRES_IN as string);

    // Gerar novo Access Token
    const new_token = this.fastify.jwt.sign(
      { role: user.role.slug },
      { sub: user_id, expiresIn: access_token_expires_in },
    );

    // Gerar novo Refresh Token (Rotate)
    const new_refresh_token = crypto.randomBytes(40).toString('hex');
    const expires_at = new Date(Date.now() + refresh_token_expires_in_ms);

    // Deleta o antigo e cria o novo
    await this.auth_repository.deleteRefreshToken(token);
    await this.auth_repository.createRefreshToken(user_id, new_refresh_token, expires_at);

    // Atualiza cache do Redis
    await this.cache.set(
      CacheKeys.auth.token(user_id),
      { user_id },
      Math.floor(parseDurationToMs(access_token_expires_in) / 1000),
    );

    return {
      token: new_token,
      refresh_token: new_refresh_token,
    };
  }
}
