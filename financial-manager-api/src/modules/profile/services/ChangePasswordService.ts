import { injectable, inject } from 'tsyringe';
import { compare, hash } from 'bcrypt';
import { AppError } from '@/shared/errors/AppError';
import { AuthRepositoryInterface } from '@/modules/auth/repositories/contracts/AuthRepositoryInterface';
import { ChangePasswordDTOType } from '../dtos/ChangePasswordDTO';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

type ChangePasswordServiceInput = ChangePasswordDTOType & { user_id: string };

@injectable()
export class ChangePasswordService {
  constructor(
    @inject('AuthRepository')
    private auth_repository: AuthRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute({ user_id, current_password, new_password }: ChangePasswordServiceInput): Promise<void> {
    const user = await this.auth_repository.findById(user_id);

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const password_match = await compare(current_password, user.password);

    if (!password_match) {
      throw new AppError('Senha atual incorreta', 400);
    }

    const hashed_password = await hash(new_password, 10);

    await this.auth_repository.updatePassword(user_id, hashed_password);

    await this.auth_repository.deleteAllUserRefreshTokens(user_id);
    await this.cache.del(CacheKeys.auth.token(user_id));
  }
}
