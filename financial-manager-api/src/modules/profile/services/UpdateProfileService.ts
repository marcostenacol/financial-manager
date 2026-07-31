import { injectable, inject } from 'tsyringe';
import { Profile } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { ProfileRepositoryInterface } from '../repositories/contracts/ProfileRepositoryInterface';
import { UpdateProfileDTOType } from '../dtos/UpdateProfileDTO';

type UpdateProfileServiceInput = UpdateProfileDTOType & { user_id: string };

@injectable()
export class UpdateProfileService {
  constructor(
    @inject('ProfileRepository')
    private profile_repository: ProfileRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute({ user_id, ...data }: UpdateProfileServiceInput): Promise<Profile> {
    const profile = await this.profile_repository.update(user_id, data);

    // Invalida cache
    await this.cache.del(CacheKeys.profile.detail(user_id));

    return profile;
  }
}
