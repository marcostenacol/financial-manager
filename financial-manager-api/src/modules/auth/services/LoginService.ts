import { injectable, inject } from 'tsyringe';
import { compare } from 'bcrypt';
import { FastifyInstance } from 'fastify';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AuthRepositoryInterface } from '../repositories/contracts/AuthRepositoryInterface';
import { LoginDTOType } from '../dtos/LoginDTO';

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
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
    const user = await this.auth_repository.findByEmail(data.email);

    if (!user) {
      throw new AppError('E-mail ou senha incorretos', 401);
    }

    const password_match = await compare(data.password, user.password);

    if (!password_match) {
      throw new AppError('E-mail ou senha incorretos', 401);
    }

    // Gerar JWT
    const token = this.fastify.jwt.sign(
      { role: 'user' }, // Payload simples por enquanto
      { sub: user.id, expiresIn: '1d' },
    );

    // Salvar no Redis para validação rápida no middleware
    await this.cache.set(`auth:token:${user.id}`, { user_id: user.id }, 86400);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: (user as any).profile?.name || 'Usuário',
      },
      token,
    };
  }
}
