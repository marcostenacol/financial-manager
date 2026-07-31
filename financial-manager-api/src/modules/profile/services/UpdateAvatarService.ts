import { injectable, inject } from 'tsyringe';
import { Profile } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { ProfileRepositoryInterface } from '../repositories/contracts/ProfileRepositoryInterface';

@injectable()
export class UpdateAvatarService {
  constructor(
    @inject('ProfileRepository')
    private profile_repository: ProfileRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute(user_id: string, avatar_filename: string): Promise<Profile> {
    // Aqui em uma implementação real, trataríamos o upload do arquivo.
    // Por enquanto, apenas atualizamos o path no banco.
    const profile = await this.profile_repository.update(user_id, {
      avatar: avatar_filename,
    });

    // Invalida cache
    await this.cache.del(CacheKeys.profile.detail(user_id));

    return profile;
  }
}
