import { injectable } from 'tsyringe';
import { Profile } from '@prisma/client';
import { BaseRepository } from '@/base/repository/BaseRepository';
import { ProfileRepositoryInterface } from './contracts/ProfileRepositoryInterface';

@injectable()
export class ProfileRepository extends BaseRepository implements ProfileRepositoryInterface {
  async findByUserId(user_id: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({
      where: { userId: user_id },
    });
  }

  async update(user_id: string, data: Partial<Profile>): Promise<Profile> {
    return this.prisma.profile.update({
      where: { userId: user_id },
      data,
    });
  }
}
