import { injectable, inject } from 'tsyringe';
import { compare } from 'bcrypt';
import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { AuthRepositoryInterface } from '../repositories/contracts/AuthRepositoryInterface';
import { LoginDTOType } from '../dtos/LoginDTO';

interface UserWithRelations {
  id: string;
  email: string;
  password: string;
  role: { slug: string };
  profile?: { name?: string | null; avatar?: string | null } | null;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  token: string;
  refresh_token: string;
}

@injectable()
export class LoginService {
  constructor(
    @inject('AuthRepository')
    private auth_repository: AuthRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
    @inject('Fastify')
    private fastify: FastifyInstance,
  ) {}

  async execute(data: LoginDTOType): Promise<LoginResponse> {
    const user = await this.auth_repository.findByEmail(data.email) as UserWithRelations | null;

    if (!user) {
      throw new AppError('E-mail ou senha incorretos', 401);
    }

    const password_match = await compare(data.password, user.password);

    if (!password_match) {
      throw new AppError('E-mail ou senha incorretos', 401);
    }

    // Gerar Access Token (JWT)
    const token = this.fastify.jwt.sign(
      { role: user.role.slug },
      { sub: user.id, expiresIn: '15m' }, // Token curto: 15 min
    );

    // Gerar Refresh Token
    const refresh_token = crypto.randomBytes(40).toString('hex');
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7); // Expira em 7 dias

    await this.auth_repository.createRefreshToken(user.id, refresh_token, expires_at);

    // Salvar no Redis para validação rápida no middleware (Access Token)
    await this.cache.set(CacheKeys.auth.token(user.id), { user_id: user.id }, 900); // 15 min

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.name || 'Usuário',
        avatar: user.profile?.avatar || undefined,
      },
      token,
      refresh_token,
    };
  }
}
