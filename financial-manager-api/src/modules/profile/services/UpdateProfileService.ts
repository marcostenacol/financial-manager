import { injectable, inject } from 'tsyringe';
import { Profile } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { ProfileRepositoryInterface } from '../repositories/contracts/ProfileRepositoryInterface';

interface UpdateProfileDTO {
  user_id: string;
  name?: string;
  bio?: string;
  avatar?: string;
}

@injectable()
export class UpdateProfileService {
  constructor(
    @inject('ProfileRepository')
    private profile_repository: ProfileRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute({ user_id, ...data }: UpdateProfileDTO): Promise<Profile> {
    const profile = await this.profile_repository.update(user_id, data);

    // Invalida cache
    await this.cache.del(`profile:user:${user_id}`);

    return profile;
  }
}
