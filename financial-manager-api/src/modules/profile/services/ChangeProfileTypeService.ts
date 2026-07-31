import { injectable, inject } from 'tsyringe';
import { Profile } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { ProfileRepositoryInterface } from '../repositories/contracts/ProfileRepositoryInterface';

@injectable()
export class ChangeProfileTypeService {
  constructor(
    @inject('ProfileRepository')
    private profile_repository: ProfileRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute(user_id: string, type: 'personal' | 'business'): Promise<Profile> {
    const profile = await this.profile_repository.update(user_id, { type });

    // Invalida cache
    await this.cache.del(CacheKeys.profile.detail(user_id));

    return profile;
  }
}
