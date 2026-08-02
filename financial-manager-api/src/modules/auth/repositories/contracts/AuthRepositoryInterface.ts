import { User, Role, RefreshToken } from '@prisma/client';
import { RegisterDTOType } from '../../dtos/RegisterDTO';

export interface UserWithRole extends User {
  role: Role;
}

export interface AuthRepositoryInterface {
  findByEmail(email: string): Promise<User | null>;
  findById(user_id: string): Promise<User | null>;
  findByIdWithRole(user_id: string): Promise<UserWithRole | null>;
  create(data: RegisterDTOType, role_id: string): Promise<User>;
  updatePassword(user_id: string, hashed_password: string): Promise<void>;
  findRoleBySlug(slug: string): Promise<Role | null>;
  createRefreshToken(user_id: string, token: string, expires_at: Date): Promise<RefreshToken>;
  findRefreshToken(token: string): Promise<RefreshToken | null>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteAllUserRefreshTokens(user_id: string): Promise<void>;
}
