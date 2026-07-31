import { injectable, inject } from 'tsyringe';
import { Profile } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { ProfileRepositoryInterface } from '../repositories/contracts/ProfileRepositoryInterface';

@injectable()
export class DetailProfileService {
  constructor(
    @inject('ProfileRepository')
    private profile_repository: ProfileRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute(user_id: string): Promise<Profile> {
    const cache_key = CacheKeys.profile.detail(user_id);

    // 1. Verificar cache
    const cached = await this.cache.get<Profile>(cache_key);
    if (cached) return cached;

    // 2. Buscar no banco
    const profile = await this.profile_repository.findByUserId(user_id);

    if (!profile) {
      throw new AppError('Perfil não encontrado', 404);
    }

    // 3. Salvar no cache (TTL 300s)
    await this.cache.set(cache_key, profile, 300);

    return profile;
  }
}
