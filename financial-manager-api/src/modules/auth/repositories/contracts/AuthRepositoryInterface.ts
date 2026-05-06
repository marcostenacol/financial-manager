import { User, Role } from '@prisma/client';
import { RegisterDTOType } from '../../dtos/RegisterDTO';

export interface AuthRepositoryInterface {
  findByEmail(email: string): Promise<User | null>;
  create(data: RegisterDTOType, role_id: string): Promise<User>;
  findRoleBySlug(slug: string): Promise<Role | null>;
}
