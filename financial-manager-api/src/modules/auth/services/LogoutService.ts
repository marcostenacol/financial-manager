import { injectable, inject } from 'tsyringe';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AuthRepositoryInterface } from '../repositories/contracts/AuthRepositoryInterface';

@injectable()
export class LogoutService {
  constructor(
    @inject('AuthRepository')
    private auth_repository: AuthRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute(user_id: string): Promise<void> {
    // Invalida cache no Redis
    await this.cache.del(`auth:token:${user_id}`);

    // Deleta todos os refresh tokens do usuário no banco
    await this.auth_repository.deleteAllUserRefreshTokens(user_id);
  }
}
