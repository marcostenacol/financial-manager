import { injectable, inject } from 'tsyringe';
import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AuthRepositoryInterface } from '../repositories/contracts/AuthRepositoryInterface';

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

    // Gerar novo Access Token
    const user_id = refresh_token_exists.userId;
    const new_token = this.fastify.jwt.sign(
      { role: 'user' },
      { sub: user_id, expiresIn: '15m' },
    );

    // Gerar novo Refresh Token (Rotate)
    const new_refresh_token = crypto.randomBytes(40).toString('hex');
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 30);

    // Deleta o antigo e cria o novo
    await this.auth_repository.deleteRefreshToken(token);
    await this.auth_repository.createRefreshToken(user_id, new_refresh_token, expires_at);

    // Atualiza cache do Redis
    await this.cache.set(`auth:token:${user_id}`, { user_id }, 900);

    return {
      token: new_token,
      refresh_token: new_refresh_token,
    };
  }
}
