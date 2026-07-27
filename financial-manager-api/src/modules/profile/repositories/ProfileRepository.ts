import { injectable } from 'tsyringe';
import { Profile } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { ProfileRepositoryInterface } from './contracts/ProfileRepositoryInterface';

@injectable()
export class ProfileRepository implements ProfileRepositoryInterface {
  async findByUserId(user_id: string): Promise<Profile | null> {
    return prisma.profile.findUnique({
      where: { userId: user_id },
    });
  }

  async update(user_id: string, data: Partial<Profile>): Promise<Profile> {
    return prisma.profile.update({
      where: { userId: user_id },
      data,
    });
  }
}
