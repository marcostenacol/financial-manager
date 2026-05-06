import { Profile } from '@prisma/client';

export interface ProfileRepositoryInterface {
  findByUserId(user_id: string): Promise<Profile | null>;
  update(user_id: string, data: Partial<Profile>): Promise<Profile>;
}
